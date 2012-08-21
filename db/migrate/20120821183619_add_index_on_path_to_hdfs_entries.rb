class AddIndexOnPathToHdfsEntries < ActiveRecord::Migration
  def change
    add_index :hdfs_entries, :path
  end
end
