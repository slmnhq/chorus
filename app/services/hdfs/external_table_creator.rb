module Hdfs
  class ExternalTableCreator
    CreationFailed = Class.new(StandardError)
    AlreadyExists = Class.new(StandardError)

    attr_accessor :workspace, :parameters, :actor, :account

    delegate :sandbox, to: :workspace

    def self.create(workspace, account, parameters, actor)
      new.tap do |table_creator|
        table_creator.workspace = workspace
        table_creator.parameters = parameters
        table_creator.actor = actor
        table_creator.account = account
      end.create
    end

    def create
      validate_parameters!
      GpdbTable.transaction do
        dataset = create_dataset
        create_event(dataset)
        create_external_table
        dataset
      end
    end

    private

    def create_dataset
      GpdbTable.create! do |dataset|
        dataset.name = parameters[:table_name]
        dataset.schema_id = workspace.sandbox_id
      end
    end

    def create_external_table
      sql = create_sql
      execute_query(sql)
    end

    def create_sql
      hdfs_entry = HdfsEntry.find(parameters[:hdfs_entry_id])

      header = parameters[:has_header].present? ? 'HEADER' : ''

      column_map = map_columns(parameters[:column_names], parameters[:types])

      "CREATE EXTERNAL TABLE \"#{parameters[:table_name]}\" (#{column_map}) LOCATION ('" +
          "#{hdfs_entry.url}') FORMAT 'TEXT' (DELIMITER '#{parameters[:delimiter]}' #{header}) SEGMENT REJECT LIMIT 2147483647"
    end

    def execute_query(sql)
      sandbox.with_gpdb_connection(account) do |conn|
        conn.exec_query(sql)
      end
    rescue ActiveRecord::StatementInvalid => e
      raise AlreadyExists, "Table already exists" if e.message.match(/relation .* already exists/)
      raise e
    rescue ActiveRecord::JDBCError => e
      raise CreationFailed, "Unable to connect to the selected database. Is the server up?"
    end

    def map_columns(column_names, column_types)
      (0...column_names.length).map {|i| "#{column_names[i]} #{column_types[i]}" }.join(", ")
    end

    def validate_parameters!
      [:hdfs_entry_id, :has_header, :column_names, :types, :delimiter, :table_name].each do |attr|
        raise ApiValidationError.new(:parameter_missing, :generic, {:message => "Parameter #{attr} missing for Hdfs External Table"}) unless parameters.has_key?(attr)
      end

      if parameters[:column_names].length != parameters[:types].length
        raise ApiValidationError.new(:column_name_missing, :generic, {:message => "Column names size should match column types for Hdfs External Table"})
      end
    end

    def create_event(dataset)
      hdfs_file = HdfsEntry.find(parameters[:hdfs_entry_id])
      Events::WorkspaceAddHdfsAsExtTable.by(actor).add(
          :workspace => workspace,
          :dataset => dataset,
          :hdfs_file => hdfs_file
      )
    end
  end
end