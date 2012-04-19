class AddOwnerIdToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :owner_id, :integer, :null => false
    add_index :instances, :owner_id
  end
end
