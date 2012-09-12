class CsvFile < ActiveRecord::Base
  attr_accessible :contents, :column_names, :types, :delimiter, :to_table, :file_contains_header, :new_table, :truncate

  serialize :column_names
  serialize :types

  belongs_to :workspace
  belongs_to :user

  has_attached_file :contents, :path => Chorus::Application.config.chorus['csv_import_file_storage_path']+ ":class/:id/:basename.:extension"

  validates :contents, :attachment_presence => true
  validates_attachment_size :contents, :less_than => Chorus::Application.config.chorus['file_sizes_mb']['csv_imports'].megabytes, :message => :file_size_exceeded

  def self.delete_old_files!
    age_limit = Chorus::Application.config.chorus['delete_unimported_csv_files_after_hours']
    return unless age_limit
    CsvFile.where("created_at < '#{Time.now - age_limit.hours}'").destroy_all
  end

  def table_already_exists(table_name)
    schema = workspace.sandbox
    account = schema.gpdb_instance.account_for_user!(user)
    check_table(table_name, account, schema)
    true
  rescue Exception => e
    false
  end

  def check_table(table_name, account, schema)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query("SELECT * FROM #{table_name} LIMIT 1")
    end
  end
end
