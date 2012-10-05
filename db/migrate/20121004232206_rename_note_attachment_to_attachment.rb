class RenameNoteAttachmentToAttachment < ActiveRecord::Migration
  def up
    rename_table :note_attachments, :attachments
    rename_index :attachments, 'index_note_attachments_on_note_id', 'index_attachments_on_note_id'

    execute("alter sequence note_attachments_id_seq rename to attachments_id_seq;")
    execute("alter index note_attachments_pkey rename to attachments_pkey;")
  end

  def down
    rename_table :attachments, :note_attachments
    rename_index :note_attachments, 'index_attachments_on_note_id', 'index_note_attachments_on_note_id'

    execute("alter sequence attachments_id_seq rename to note_attachments_id_seq;")
    execute("alter index attachments_pkey rename to note_attachments_pkey;")
  end

end
