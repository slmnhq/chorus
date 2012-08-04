class AddStaleToGpdbDatabaseAndGpdbSchema < ActiveRecord::Migration
  def change
    add_column :gpdb_databases, :stale_at, :datetime
    add_column :gpdb_schemas,   :stale_at, :datetime
  end
end
