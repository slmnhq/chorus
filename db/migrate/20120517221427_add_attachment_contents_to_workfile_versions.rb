class AddAttachmentContentsToWorkfileVersions < ActiveRecord::Migration
  def self.up
    add_column :workfile_versions, :contents_file_name, :string
    add_column :workfile_versions, :contents_content_type, :string
    add_column :workfile_versions, :contents_file_size, :integer
    add_column :workfile_versions, :contents_updated_at, :datetime
  end

  def self.down
    remove_column :workfile_versions, :contents_file_name
    remove_column :workfile_versions, :contents_content_type
    remove_column :workfile_versions, :contents_file_size
    remove_column :workfile_versions, :contents_updated_at
  end
end
