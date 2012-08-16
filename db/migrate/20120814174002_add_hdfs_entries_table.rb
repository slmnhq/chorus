class AddHdfsEntriesTable < ActiveRecord::Migration
  def up
    create_table :hdfs_entries do |t|
      t.string :path
      t.string :parent_path
      t.integer :hadoop_instance_id
      t.datetime :modified_at
      t.integer :size
      t.boolean :is_directory
      t.integer :content_count
      t.integer :parent_id
      t.timestamps
    end
  end

  def down
    drop_table :hdfs_entries
  end
end
