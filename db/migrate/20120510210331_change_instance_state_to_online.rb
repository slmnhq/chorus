class ChangeInstanceStateToOnline < ActiveRecord::Migration
  class Instance < ActiveRecord::Base; end

  def up
    add_column :instances, :online, :boolean, :default => true
    Instance.reset_column_information

    Instance.where("state <> 'online'").update_all(:online => false)

    remove_column :instances, :state
  end

  def down
    add_column :instances, :state, :string, :default => "offline"
    Instance.reset_column_information

    Instance.where("online").update_all(:state => "online")

    remove_column :instances, :online
  end
end
