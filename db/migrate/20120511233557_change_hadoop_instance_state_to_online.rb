class ChangeHadoopInstanceStateToOnline < ActiveRecord::Migration
  def up
    add_column :hadoop_instances, :online, :boolean, :default => true
    HadoopInstance.reset_column_information
    HadoopInstance.where("state <> 'online'").update_all(:online => false)
    remove_column :hadoop_instances, :state
  end

  def down
    add_column :hadoop_instances, :state, :string, :default => "offline"
    HadoopInstance.reset_column_information
    HadoopInstance.where("online").update_all(:state => "online")
    remove_column :hadoop_instances, :online
  end
end
