class RenameInstanceAccountInstanceIdColumn < ActiveRecord::Migration
  def change
    rename_column :instance_accounts, :instance_id, :gpdb_instance_id
  end
end
