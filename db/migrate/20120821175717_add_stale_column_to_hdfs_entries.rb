class AddStaleColumnToHdfsEntries < ActiveRecord::Migration
  def change
    add_column :hdfs_entries, :stale_at, :datetime
  end
end
