class IncreaseHdfsPathLength < ActiveRecord::Migration
  def up
    change_column :hdfs_file_references, :path, :string, :limit => 2048
  end

  def down
    change_column :hdfs_file_references, :path, :string, :limit => 255
  end
end
