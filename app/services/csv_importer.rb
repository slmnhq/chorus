class CsvImporter

  attr_accessor :csv_file, :schema, :account, :import_created_event_id

  CREATE_TABLE_STRING = Rails.env.test? ? 'create temporary table' : 'create table'

  def self.import_file(csv_file_id, import_created_event_id)
    csv_importer = new(csv_file_id, import_created_event_id)
    csv_importer.import
    csv_importer.csv_file.delete
  end

  def initialize(csv_file_id, import_created_event_id)
    self.csv_file = CsvFile.find(csv_file_id)
    self.import_created_event_id = import_created_event_id
    self.schema = csv_file.workspace.sandbox
    self.account = schema.gpdb_instance.account_for_user!(csv_file.user)
  end

  def import
    schema.with_gpdb_connection(account) do |connection|
      begin
        it_exists = check_if_table_exists(csv_file.to_table, connection)
        if csv_file.new_table
          connection.exec_query("CREATE TABLE #{csv_file.to_table}(#{create_table_sql});")
        end

        if csv_file.truncate
          connection.exec_query("TRUNCATE TABLE #{csv_file.to_table};")
        end

        copy_manager = org.postgresql.copy.CopyManager.new(connection.instance_variable_get(:"@connection").connection)
        sql = "COPY #{csv_file.to_table}(#{column_names_sql}) FROM STDIN WITH DELIMITER '#{csv_file.delimiter}' CSV #{header_sql}"
        copy_manager.copy_in(sql, java.io.FileReader.new(csv_file.contents.path) )
      rescue
        connection.exec_query("DROP TABLE IF EXISTS #{csv_file.to_table}") if csv_file.new_table && it_exists == false
        raise
      end
    end
    create_success_event
  rescue => e
    create_failure_event(e.message)
  end

  def check_if_table_exists(table_name, connection)
    connection.exec_query("SELECT * FROM #{table_name} LIMIT 1")
    true
  rescue
    false
  end

  def create_success_event
    Events::FileImportCreated.find(import_created_event_id).tap do |event|
      event.dataset = destination_dataset
      event.save!
    end

    Events::FileImportSuccess.by(csv_file.user).add(
        :workspace => csv_file.workspace,
        :dataset => destination_dataset,
        :file_name => csv_file.contents_file_name,
        :import_type => 'file'
    )
  end

  def create_failure_event(error_message)
    Events::FileImportFailed.by(csv_file.user).add(
        :workspace => csv_file.workspace,
        :file_name => csv_file.contents_file_name,
        :import_type => 'file',
        :destination_table => csv_file.to_table,
        :error_message => error_message
    )
  end

  def destination_dataset
    @destination_dataset ||= get_destination_dataset
  end

  def destination_dataset
    Dataset.refresh(account, schema)
    schema.datasets.find_by_name(csv_file.to_table)
  end

  # column_mapping is direct postgresql types
  def create_table_sql
    csv_file.column_names.zip(csv_file.types).map{|a,b| "#{a} #{b}"}.join(", ")
  end

  def column_names_sql
    csv_file.column_names.join(', ')
  end

  def header_sql
    csv_file.file_contains_header ? "HEADER" : ""
  end
end
