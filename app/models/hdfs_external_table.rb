class HdfsExternalTable
  CreationFailed = Class.new(StandardError)
  AlreadyExists = Class.new(StandardError)

  class << self # singleton class

    def create(workspace, account, parameters, creator)
      parameters[:path] = parameters[:pathname]
      sql = create_sql(parameters)
      execute_query(sql, workspace.sandbox, account)
      create_dataset(workspace.sandbox, parameters[:table_name]).tap do |dataset|
        create_event(dataset, workspace, parameters, creator)
      end
    end

    def execute_query (sql, schema, account)
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

    private

    def create_dataset(schema, table_name)
      GpdbTable.find_or_create_by_name_and_schema_id(table_name, schema.id)
    end

    def create_sql(parameters)
      validate_parameters!(parameters)

      hdfs_entry = HdfsEntry.find(parameters[:hdfs_entry_id])

      header = parameters[:has_header].present? ? 'HEADER' : ''

      column_map = map_columns(parameters[:column_names], parameters[:types])

      "CREATE EXTERNAL TABLE #{parameters[:table_name]} (#{column_map}) LOCATION ('" +
          "#{hdfs_entry.url}') FORMAT 'TEXT' (DELIMITER '#{parameters[:delimiter]}' #{header}) SEGMENT REJECT LIMIT 2147483647"
    end

    def map_columns(column_names, column_types)
      (0...column_names.length).map {|i| "#{column_names[i]} #{column_types[i]}" }.join(", ")
    end

    def validate_parameters!(parameters)
      [:hdfs_entry_id, :has_header, :column_names, :types, :delimiter, :table_name].each do |attr|
        raise ApiValidationError.new(:parameter_missing, :generic, {:message => "Parameter #{attr} missing for Hdfs External Table"}) unless parameters.has_key?(attr)
      end

      if parameters[:column_names].length != parameters[:types].length
        raise ApiValidationError.new(:column_name_missing, :generic, {:message => "Column names size should match column types for Hdfs External Table"})
      end
    end

    def create_event(dataset, workspace, parameters, creator)
      hdfs_entry = HdfsEntry.find(parameters[:hdfs_entry_id])

      Events::WorkspaceAddHdfsAsExtTable.by(creator).add(
          :workspace => workspace,
          :dataset => dataset,
          :hdfs_file => hdfs_entry
      )
    end
  end
end