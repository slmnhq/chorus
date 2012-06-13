class Draft < ActiveRecord::Migration
  def change
    remove_column :workfile_drafts, :contents_file_name
    remove_column :workfile_drafts, :contents_content_type
    remove_column :workfile_drafts, :contents_file_size
    remove_column :workfile_drafts, :contents_updated_at
    add_column :workfile_drafts, :content, :text
  end
end
