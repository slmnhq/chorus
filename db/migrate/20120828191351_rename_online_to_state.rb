class RenameOnlineToState < ActiveRecord::Migration
  class Instance < ActiveRecord::Base; end

  def up
    add_column :gpdb_instances, :state, :string, :default => 'online'
    GpdbInstance.reset_column_information

    GpdbInstance.update_all(:state => 'online')
    GpdbInstance.where("online = false").update_all(:state => 'offline')

    remove_column :gpdb_instances, :online
  end

  def down
    add_column :gpdb_instances, :online, :boolean, :default => true
    GpdbInstance.reset_column_information

    GpdbInstance.where("state <> 'online'").update_all(:online => false)

    remove_column :gpdb_instances, :state
  end
end
