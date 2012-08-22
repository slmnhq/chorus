class HdfsExternalTable
  CreationFailed = Class.new(StandardError)
  AlreadyExists = Class.new(StandardError)

  def self.create_sql(parameters)
    validate_parameters!(parameters)

    hadoop = HadoopInstance.find(parameters[:hadoop_instance_id])

    hdfs_file = HdfsFile.new(parameters[:path], hadoop)
    header = parameters[:has_header].present? ? 'HEADER' : ''

    column_map = map_columns(parameters[:column_names], parameters[:types])

    "CREATE EXTERNAL TABLE #{parameters[:table_name]} (#{column_map}) LOCATION ('" +
      "#{hdfs_file.url}') FORMAT 'TEXT' (DELIMITER '#{parameters[:delimiter]}' #{header}) SEGMENT REJECT LIMIT 2147483647"
  end

  def self.execute_query (sql, schema, account)
    schema.with_gpdb_connection(account) do |conn|
      conn.exec_query(sql)
    end
  rescue => e
    if e.message.match(/relation .* already exists/)
      raise AlreadyExists, "Table already exists"
    else
      raise CreationFailed, "Unable to connect to the selected database. Is the server up?"
    end
  end

  def self.create(workspace, account, parameters, creator)
    parameters[:path] = parameters[:pathname]
    sql = create_sql(parameters)
    execute_query(sql, workspace.sandbox, account)
    dataset = create_dataset(workspace.sandbox, parameters[:table_name])
    create_event(dataset, workspace, parameters, creator)
  end

  def self.map_columns(column_names, column_types)
    (0...column_names.length).map {|i| "#{column_names[i]} #{column_types[i]}" }.join(", ")
  end

  def self.validate_parameters!(parameters)
    all_present = [:hadoop_instance_id, :has_header, :path, :column_names, :types, :delimiter, :table_name].all? do |attr|
      parameters.key? attr
    end
    raise ApiValidationError.new(:parameter_missing, :generic, {:message => "One or more parameters missing for Hdfs External Table"}) unless all_present

    if parameters[:column_names].length != parameters[:types].length
      raise ApiValidationError.new(:column_name_missing, :generic, {:message => "Column names size should match column types for Hdfs External Table"})
    end
  end

  def self.create_dataset(schema, table_name)
    GpdbTable.find_or_create_by_name_and_schema_id(table_name, schema.id)
  end

  def self.create_event(dataset, workspace, parameters, creator)
    hdfs_entry = HdfsEntry.find_or_create_by_hadoop_instance_id_and_path(parameters[:hadoop_instance_id], parameters[:path])

    Events::WorkspaceAddHdfsAsExtTable.by(creator).add(
        :workspace => workspace,
        :dataset => dataset,
        :hdfs_file => hdfs_entry
    )
  end
end