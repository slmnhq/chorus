class CsvFile < ActiveRecord::Base
  attr_accessible :contents, :column_names, :types, :delimiter, :to_table, :header

  serialize :column_names
  serialize :types

  belongs_to :workspace
  belongs_to :user

  has_attached_file :contents, :path => Chorus::Application.config.chorus['csv_import_file_storage_path']+ ":class/:id/:basename.:extension"

  validates :contents, :attachment_presence => true
end