class RemoveParentPathFromHdfsEntries < ActiveRecord::Migration
  def up
    remove_column :hdfs_entries, :parent_path
  end

  def down
    add_column :hdfs_entries, :parent_path, :string
  end
end
