class GpTableCopier
  ImportFailed = Class.new(StandardError)

  def self.run_import(source_table_id, user_id, options)
    instance = new(source_table_id, user_id, options)
    instance.run

    Dataset.refresh(instance.destination_account, instance.destination_schema)
    dst_table = instance.destination_schema.datasets.find_by_name(instance.destination_table_name)
    create_success_event(dst_table, instance.source_table, instance.destination_workspace, User.find(user_id))
  rescue Exception => e
    user = User.find_by_id(user_id)
    src_table = Dataset.find_by_id(source_table_id)
    dst_workspace = Workspace.find_by_id(options["workspace_id"])
    create_failed_event(options["to_table"], src_table, dst_workspace, e.message, user)
  end

  def initialize(source_table_id, user_id, options)
    @source_table_id = source_table_id
    @user_id = user_id
    @options = options
  end

  def distribution_key_clause
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
    create_command = "CREATE TABLE #{destination_table_fullname} (LIKE #{source_table_fullname} INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES) #{distribution_key_clause};"
    copy_command = "INSERT INTO #{destination_table_fullname} (SELECT * FROM #{source_table_fullname} #{limit_clause});"
    truncate_command = "TRUNCATE TABLE #{destination_table_fullname};"
    internal_error_message = nil

    begin
      destination_schema.with_gpdb_connection(destination_account) do |connection|
        connection.transaction do
          begin

            if create_new_table?
              execute_sql(connection, create_command)
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

  def self.create_success_event(dst_table, source_table, workspace, user)
    Events::DatasetImportSuccess.by(user).add(
        :workspace => workspace,
        :dataset => dst_table,
        :source_dataset => source_table
    )
  end

  def self.create_failed_event(to_table, source_table, workspace, error_message, user)
    Events::DatasetImportFailed.by(user).add(
        :workspace => workspace,
        :destination_table => to_table,
        :error_message => error_message,
        :source_dataset => source_table
    )
  end

  def create_new_table?
    @options["new_table"] == "true"
  end

  def row_limit
    @options["sample_count"]
  end

  def destination_table_name
    @options["to_table"]
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
    @destination_workspace ||= Workspace.find(@options["workspace_id"])
  end

  def destination_schema
    destination_workspace.sandbox
  end

  def destination_account
    @destination_account ||= destination_schema.instance.account_for_user!(user)
  end

  def source_account
    @source_account ||= source_schema.instance.account_for_user!(user)
  end

  def destination_table_fullname
    @destination_table_fullname ||= "\"#{destination_schema.name}\".\"#{destination_table_name}\""
  end

  def source_table_fullname
    @source_table_fullname ||= "\"#{source_schema.name}\".\"#{source_table.name}\""
  end

  def truncate?
    @options["truncate"] == "true"
  end

  private

  def distribution_key_sql
    <<-DISTRIBUTION_KEY_SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(attrnums, 1)) AS rn
      FROM   gp_distribution_policy where localoid = '#{source_schema.name}.#{source_table.name}'::regclass
      ) y, pg_attribute WHERE attrelid = '#{source_schema.name}.#{source_table.name}'::regclass::oid AND attrnums[rn] = attnum ORDER by rn;
    DISTRIBUTION_KEY_SQL
  end
end