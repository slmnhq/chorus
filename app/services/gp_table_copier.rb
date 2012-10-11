class GpTableCopier
  ImportFailed = Class.new(StandardError)

  attr_accessor :user_id, :source_table_id, :attributes

  def self.run_import(source_table_id, user_id, attributes)
    copier = new(source_table_id, user_id, attributes)
    copier.start
  end

  def start
    Dataset.refresh(destination_account, destination_schema)
    dst_table = destination_schema.datasets.find_by_name(destination_table_name)
    self.attributes["new_table"] = false if create_new_table? && dst_table
    raise ActiveRecord::RecordNotFound, "Couldn't find destination table." if !create_new_table? && !dst_table

    run

    create_success_event

  rescue Exception => e
    create_failed_event(e.message)
    raise e
  end

  def initialize(source_table_id, user_id, attributes)
    self.source_table_id = source_table_id
    self.user_id = user_id
    self.attributes = HashWithIndifferentAccess.new(attributes)
  end

  def distribution_key_clause
    return 'DISTRIBUTED RANDOMLY' if source_table.is_a?(ChorusView)
    return @distribution_key_clause if @distribution_key_clause
    @distribution_key_clause = source_schema.with_gpdb_connection(source_account) do |connection|
      rows = connection.exec_query(distribution_key_sql)
      clause = rows.empty? ? 'DISTRIBUTED RANDOMLY' : "DISTRIBUTED BY(#{quote_and_join(rows)})"
    end
  end

  def quote_and_join(collection)
    collection.map do |element|
      "\"#{element['attname']}\""
    end.join(', ')
  end

  def limit_clause
    row_limit.nil? ? '' : "LIMIT #{row_limit}"
  end

  def run
    create_command = "CREATE TABLE #{destination_table_fullname} (%s) #{distribution_key_clause};"
    copy_command = "INSERT INTO #{destination_table_fullname} (SELECT * FROM #{source_table_fullname} #{limit_clause});"
    truncate_command = "TRUNCATE TABLE #{destination_table_fullname};"
    internal_error_message = nil

    begin
      destination_schema.with_gpdb_connection(destination_account) do |connection|
        connection.transaction do

          begin
            unless source_table.query_setup_sql.blank?
              execute_sql(connection, source_table.query_setup_sql)
            end

            if create_new_table?
              execute_sql(connection, create_command % [table_definition_with_keys(connection)])
            elsif truncate?
              execute_sql(connection, truncate_command)
            end
            execute_sql(connection, copy_command)
          rescue => e
            internal_error_message = e.message
            raise
          end
        end
      end
    rescue => e
      if internal_error_message.present?
        raise ImportFailed, internal_error_message
      else
        raise e
      end
    end
  end

  def execute_sql(connection, sql)
    connection.execute(sql)
  end

  def create_success_event
    user = User.find_by_id!(user_id)
    source_table = Dataset.find_by_id!(source_table_id)
    workspace = Workspace.find_by_id!(attributes[:workspace_id])

    Dataset.refresh(destination_account, destination_schema)
    dst_table = destination_schema.datasets.find_by_name!(destination_table_name)

    Events::DatasetImportCreated.find(attributes[:dataset_import_created_event_id]).tap do |event|
      event.dataset = dst_table
      event.save!
    end

    event = Events::DatasetImportSuccess.by(user).add(
        :workspace => workspace,
        :dataset => dst_table,
        :source_dataset => source_table
    )

    Notification.create!(:recipient_id => user.id, :event_id => event.id)
  end

  def create_failed_event(error_message)
    user = User.find_by_id(user_id)
    source_table = Dataset.find_by_id(source_table_id)
    workspace = Workspace.find_by_id(attributes[:workspace_id])
    event = Events::DatasetImportFailed.by(user).add(
        :workspace => workspace,
        :destination_table => attributes[:to_table],
        :error_message => error_message,
        :source_dataset => source_table
    )

    Notification.create!(:recipient_id => user.id, :event_id => event.id)
  end

  def create_new_table?
    attributes["new_table"].to_s == "true"
  end

  def row_limit
    attributes["sample_count"]
  end

  def destination_table_name
    attributes["to_table"]
  end

  def user
    @user ||= User.find(@user_id)
  end

  def source_table
    @source_table ||= Dataset.find(@source_table_id)
  end

  def source_schema
    source_table.schema
  end

  def destination_workspace
    @destination_workspace ||= Workspace.find(attributes["workspace_id"])
  end

  def destination_schema
    destination_workspace.sandbox
  end

  def destination_account
    @destination_account ||= destination_schema.gpdb_instance.account_for_user!(user)
  end

  def source_account
    @source_account ||= source_schema.gpdb_instance.account_for_user!(user)
  end

  def destination_table_fullname
    @destination_table_fullname ||= "\"#{destination_schema.name}\".\"#{destination_table_name}\""
  end

  def source_table_fullname
    @source_table_fullname ||= source_table.scoped_name
  end

  def truncate?
    attributes["truncate"].to_s == "true"
  end

  def table_definition(connection)
    return @table_definition if @table_definition
    # No way of testing ordinal position clause since we can't reproduce an out of order result from the following query
    arr = connection.exec_query(describe_table)
    @table_definition = arr.map { |col_def| "\"#{col_def["column_name"]}\" #{col_def["data_type"]}" }.join(", ")
  end

  def table_definition_with_keys(connection)
    return @table_definition_with_keys if @table_definition_with_keys
    primary_key_rows = connection.exec_query(primary_key_sql)
    primary_key_clause = primary_key_rows.empty? ? '' : ", PRIMARY KEY(#{quote_and_join(primary_key_rows)})"
    @table_definition_with_keys = "#{table_definition(connection)}#{primary_key_clause}"
  end

  private

  def distribution_key_sql
    <<-DISTRIBUTION_KEY_SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(attrnums, 1)) AS rn
      FROM   gp_distribution_policy where localoid = '#{source_table_fullname}'::regclass
      ) y, pg_attribute WHERE attrelid = '#{source_table_fullname}'::regclass::oid AND attrnums[rn] = attnum ORDER by rn;
    DISTRIBUTION_KEY_SQL
  end

  def primary_key_sql
    <<-PRIMARYKEYSQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(conkey, 1)) AS rn
      FROM   pg_constraint where conrelid = '#{source_table_fullname}'::regclass and contype='p'
      ) y, pg_attribute WHERE attrelid = '#{source_table_fullname}'::regclass::oid AND conkey[rn] = attnum ORDER by rn;
    PRIMARYKEYSQL
  end

  def describe_table
    <<-DESCRIBETABLESQL
      SELECT a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid
          AND d.adnum = a.attnum
          AND a.atthasdef),
        a.attnotnull, a.attnum,
        NULL AS attcollation
      FROM pg_catalog.pg_attribute a
      WHERE a.attrelid =
          (SELECT c.oid
          FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname ~ '^(#{source_table.name})$'
            #{source_table.is_a?(ChorusView) ? '' : "AND n.nspname ~ '^(#{source_schema.name})$'"})
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum;
    DESCRIBETABLESQL
  end
end