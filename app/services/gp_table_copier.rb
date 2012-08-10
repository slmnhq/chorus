class GpTableCopier
  attr_reader :src_schema, :src_table_name, :dst_schema, :dst_table_name
  attr_reader :src_account, :dst_account
  attr_reader :src_instance, :dst_instance
  attr_reader :src_database_name, :dst_database_name
  attr_reader :row_limit

  def initialize(src_schema, src_table_name, dst_schema, dst_table_name, user, row_limit = nil)
    @src_schema = src_schema
    @src_database_name = src_schema.database.name
    @src_instance = src_schema.instance
    @src_account = src_instance.account_for_user!(user)
    @src_table_name = src_table_name
    @dst_database_name = dst_schema.database.name
    @dst_instance = dst_schema.instance
    @dst_account = dst_instance.account_for_user!(user)
    @dst_table_name = dst_table_name
    @row_limit = row_limit
    @dst_schema = dst_schema
  end

  def distribution_key_clause
    return @distribution_key_clause if @distribution_key_clause
    @distribution_key_clause = src_schema.with_gpdb_connection(dst_account) do |connection|
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

  def dst_fullname
    @dst_fullname ||= "\"#{dst_schema.name}\".\"#{dst_table_name}\""
  end

  def src_fullname
    @src_fullname ||= "\"#{src_schema.name}\".\"#{src_table_name}\""
  end

  def run
    create_command = "CREATE TABLE #{dst_fullname} (LIKE #{src_fullname} INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES) #{distribution_key_clause};"
    copy_command = "INSERT INTO #{dst_fullname} (SELECT * FROM #{src_fullname} #{limit_clause});"
    dst_schema.with_gpdb_connection(dst_account) do |connection|
      connection.transaction do
        connection.execute(create_command)
        connection.execute(copy_command)
      end
    end
  end

  private

  def distribution_key_sql
    <<-DISTRIBUTION_KEY_SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(attrnums, 1)) AS rn
      FROM   gp_distribution_policy where localoid = '#{src_schema.name}.#{src_table_name}'::regclass
      ) y, pg_attribute WHERE attrelid = '#{src_schema.name}.#{src_table_name}'::regclass::oid AND attrnums[rn] = attnum ORDER by rn;
    DISTRIBUTION_KEY_SQL
  end
end