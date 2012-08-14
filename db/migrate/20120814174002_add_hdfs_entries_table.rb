class AddHdfsEntriesTable < ActiveRecord::Migration
  def up
    create_table :hdfs_entries do |t|
      t.string :path
      t.integer :hadoop_instance_id
      t.timestamps
    end
  end

  def down
    drop_table :hdfs_entries
  end
end
