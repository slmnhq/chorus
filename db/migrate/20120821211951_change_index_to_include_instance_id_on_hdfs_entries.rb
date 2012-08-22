class ChangeIndexToIncludeInstanceIdOnHdfsEntries < ActiveRecord::Migration
  def change
    remove_index :hdfs_entries, :path
    add_index :hdfs_entries, [:hadoop_instance_id, :path], :unique => true
  end
end
