class CsvFile < ActiveRecord::Base
  attr_accessible :contents, :column_names, :types, :delimiter, :to_table, :file_contains_header, :new_table

  serialize :column_names
  serialize :types

  belongs_to :workspace
  belongs_to :user

  has_attached_file :contents, :path => Chorus::Application.config.chorus['csv_import_file_storage_path']+ ":class/:id/:basename.:extension"

  validates :contents, :attachment_presence => true

  def self.delete_old_files!
    age_limit = Chorus::Application.config.chorus['delete_unimported_csv_files_after_hours']
    return unless age_limit
    CsvFile.where("created_at < '#{Time.now - age_limit.hours}'").destroy_all
  end
end