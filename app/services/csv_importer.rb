class CsvImporter

  attr_reader :csv_file

  CREATE_TABLE_STRING = Rails.env.test? ? 'create temporary table' : 'create table'

  def initialize(csv_file)
    @csv_file = csv_file
  end

  def import_using(schema)
    account = schema.instance.account_for_user!(csv_file.user)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query("CREATE TABLE #{csv_file.to_table}(#{create_table_sql});")
      copy_manager = org.postgresql.copy.CopyManager.new(connection.instance_variable_get(:"@connection").connection)
      sql = "COPY #{csv_file.to_table}(#{column_names_sql}) FROM STDIN WITH DELIMITER '#{csv_file.delimiter}' CSV #{header_sql}"
      copy_manager.copy_in(sql, java.io.FileReader.new(csv_file.contents.path) )
    end
  end

  # column_mapping is direct postgresql types
  def create_table_sql
    csv_file.column_names.zip(csv_file.types).map{|a,b| "#{a} #{b}"}.join(", ")
  end

  def column_names_sql
    csv_file.column_names.join(', ')
  end

  def header_sql
    csv_file.header ? "" : "HEADER"
  end
end
