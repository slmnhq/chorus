class AddAttachmentContentsToWorkfileDrafts < ActiveRecord::Migration
  def self.up
    add_column :workfile_drafts, :contents_file_name, :string
    add_column :workfile_drafts, :contents_content_type, :string
    add_column :workfile_drafts, :contents_file_size, :integer
    add_column :workfile_drafts, :contents_updated_at, :datetime
  end

  def self.down
    remove_column :workfile_drafts, :contents_file_name
    remove_column :workfile_drafts, :contents_content_type
    remove_column :workfile_drafts, :contents_file_size
    remove_column :workfile_drafts, :contents_updated_at
  end
end
