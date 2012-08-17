class AddContentsContentTypeToNoteAttachments < ActiveRecord::Migration
  def change
    add_column :note_attachments, :contents_content_type, :string
  end
end
