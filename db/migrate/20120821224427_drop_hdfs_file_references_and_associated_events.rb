class DropHdfsFileReferencesAndAssociatedEvents < ActiveRecord::Migration
  def up
    drop_table :hdfs_file_references
    execute "truncate table activities;"
    execute "truncate table events;"
  end

  def down
    create_table :hdfs_file_references do |t|
      t.string :path, :limit => 2048
      t.integer :hadoop_instance_id
      t.timestamps
    end
  end
end
