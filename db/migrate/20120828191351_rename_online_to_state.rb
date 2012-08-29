class RenameOnlineToState < ActiveRecord::Migration
  class Instance < ActiveRecord::Base; end

  def up
    add_column :instances, :state, :string, :default => 'online'
    Instance.reset_column_information

    Instance.update_all(:state => 'online')
    Instance.where("online = false").update_all(:state => 'offline')

    remove_column :instances, :online
  end

  def down
    add_column :instances, :online, :boolean, :default => true
    Instance.reset_column_information

    Instance.where("state <> 'online'").update_all(:online => false)

    remove_column :instances, :state
  end
end
