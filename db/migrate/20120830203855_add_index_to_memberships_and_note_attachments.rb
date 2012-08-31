class AddIndexToMembershipsAndNoteAttachments < ActiveRecord::Migration
  def up
    add_index :memberships, [:user_id, :workspace_id]
    add_index :note_attachments, :note_id
  end

  def down
    remove_index :memberships, [:user_id, :workspace_id]
    remove_index :note_attachments, :note_id
  end
end
