class CsvImporter

  CREATE_TABLE_STRING = Rails.env.test? ? 'create temporary table' : 'create table'

  def self.import_file(csv_file_id)
    csv_file = CsvFile.find(csv_file_id)
    schema = csv_file.workspace.sandbox
    account = schema.instance.account_for_user!(csv_file.user)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query("CREATE TABLE #{csv_file.to_table}(#{create_table_sql(csv_file)});")
      copy_manager = org.postgresql.copy.CopyManager.new(connection.instance_variable_get(:"@connection").connection)
      sql = "COPY #{csv_file.to_table}(#{column_names_sql(csv_file)}) FROM STDIN WITH DELIMITER '#{csv_file.delimiter}' CSV #{header_sql(csv_file)}"
      copy_manager.copy_in(sql, java.io.FileReader.new(csv_file.contents.path) )
    end
  end

  # column_mapping is direct postgresql types
  def self.create_table_sql(csv_file)
    csv_file.column_names.zip(csv_file.types).map{|a,b| "#{a} #{b}"}.join(", ")
  end

  def self.column_names_sql(csv_file)
    csv_file.column_names.join(', ')
  end

  def self.header_sql(csv_file)
    csv_file.header ? "" : "HEADER"
  end
end
