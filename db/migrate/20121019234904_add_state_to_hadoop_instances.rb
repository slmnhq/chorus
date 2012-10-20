class AddStateToHadoopInstances < ActiveRecord::Migration
  def up
    add_column :hadoop_instances, :state, :string, :default => "online", :null => false
    execute "UPDATE hadoop_instances SET state = 'offline' WHERE online = false"
    remove_column :hadoop_instances, :online
  end

  def down
    add_column :hadoop_instances, :online, :boolean, :default => true, :null => false
    execute "UPDATE hadoop_instances SET online = false WHERE state = 'offline'"
    remove_column :hadoop_instances, :state
  end
end
