class AddIndexToDraft < ActiveRecord::Migration
  def change
    add_index :workfile_drafts, [:workfile_id, :owner_id], :unique => true
  end
end
