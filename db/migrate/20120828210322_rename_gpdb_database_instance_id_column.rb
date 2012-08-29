class RenameGpdbDatabaseInstanceIdColumn < ActiveRecord::Migration
  def change
    rename_column :gpdb_databases, :instance_id, :gpdb_instance_id
  end
end
