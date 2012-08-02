class ChangeHadoopInstanceStateToOnline < ActiveRecord::Migration
  def up
    add_column :hadoop_instances, :online, :boolean, :default => true
    execute("UPDATE hadoop_instances SET online = 'f' WHERE state <> 'online'")
    remove_column :hadoop_instances, :state
  end

  def down
    add_column :hadoop_instances, :state, :string, :default => "offline"
    execute("UPDATE hadoop_instances SET state = 'online' WHERE online = 't'")
    remove_column :hadoop_instances, :online
  end
end
