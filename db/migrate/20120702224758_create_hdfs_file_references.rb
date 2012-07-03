class CreateHdfsFileReferences < ActiveRecord::Migration
  def change
    create_table :hdfs_file_references do |t|
      t.string :path
      t.integer :hadoop_instance_id
      t.timestamps
    end
  end
end
