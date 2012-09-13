class AddPaperclipFieldsToNoteAttachments < ActiveRecord::Migration
  def self.up
    add_column :note_attachments, :contents_file_size, :integer
    add_column :note_attachments, :contents_updated_at, :datetime
  end

  def self.down
    remove_column :note_attachments, :contents_file_size
    remove_column :note_attachments, :contents_updated_at
  end
end
