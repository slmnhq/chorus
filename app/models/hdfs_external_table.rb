class HdfsExternalTable

  def self.create_sql(parameters)

    all_present = [:hadoop_instance_id, :has_header, :path, :column_names, :types, :delimiter, :table_name].all? do |attr|
      parameters.key? attr
    end

    raise ApiValidationError, "One or more parameters missing for Hdfs External Table" unless all_present

    column_names = parameters[:column_names]
    column_types = parameters[:types]

    if column_names.length != column_types.length
      raise ApiValidationError, "Column names size should match column types for Hdfs External Table"
    end

    hadoop = HadoopInstance.find(parameters[:hadoop_instance_id])
    hdfs_file = HdfsFile.new(parameters[:path], hadoop)
    header = parameters[:has_header].present? ? 'HEADER' : ''

    column_map = (0...column_names.length).map {|i| "#{column_names[i]} #{column_types[i]}" }.join(", ")

    "CREATE EXTERNAL TABLE #{parameters[:table_name]} (#{column_map}) LOCATION ('" +
      "#{hdfs_file.url}') FORMAT 'TEXT' (DELIMITER '#{parameters[:delimiter]}' #{header}) SEGMENT REJECT LIMIT 2147483647"
  end

  def self.execute_query (sql, schema, account)
    schema.with_gpdb_connection(account) do |conn|
      conn.exec_query(sql)
    end
  end

  def self.create(schema, account, parameters)
    sql = create_sql(parameters)
    execute_query(sql, schema, account)
  end
end