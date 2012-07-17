class CsvFile < ActiveRecord::Base
  attr_accessible :contents

  belongs_to :workspace
  has_attached_file :contents, :path => Chorus::Application.config.chorus['csv_import_file_storage_path']+ ":class/:id/:basename.:extension"

  validates :contents, :attachment_presence => true
end