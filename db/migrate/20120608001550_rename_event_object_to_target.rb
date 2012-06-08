class RenameEventObjectToTarget < ActiveRecord::Migration
  def change
    rename_column :events, :object_id, :target_id
    rename_column :events, :object_type, :target_type
  end
end
