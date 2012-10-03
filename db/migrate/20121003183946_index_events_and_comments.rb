class IndexEventsAndComments < ActiveRecord::Migration
  def up
    add_index :events, :workspace_id
    add_index :comments, :event_id
  end

  def down
    remove_index :events, :workspace_id
    remove_index :comments, :event_id
  end
end
