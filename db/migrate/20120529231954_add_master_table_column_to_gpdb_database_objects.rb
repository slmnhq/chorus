class AddMasterTableColumnToGpdbDatabaseObjects < ActiveRecord::Migration
  def change
    add_column :gpdb_database_objects, :master_table, :boolean, :default => false
  end
end
