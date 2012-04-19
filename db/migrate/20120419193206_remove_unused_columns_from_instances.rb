class RemoveUnusedColumnsFromInstances < ActiveRecord::Migration
  def up
    remove_column :instances, :owner
    remove_column :instances, :expire
    remove_column :instances, :state
    remove_column :instances, :provision_type
    remove_column :instances, :provision_id
    remove_column :instances, :size
    remove_column :instances, :instance_provider
    remove_column :instances, :last_check
    remove_column :instances, :provision_name
    remove_column :instances, :is_deleted
    remove_column :instances, :instance_version
    remove_column :instances, :connection_string
  end

  def down
    add_column :instances, :owner, :string
    add_column :instances, :expire, :date
    add_column :instances, :state, :string
    add_column :instances, :provision_type, :string
    add_column :instances, :provision_id, :string, :length => 20
    add_column :instances, :size, :integer
    add_column :instances, :instance_provider, :string
    add_column :instances, :last_check, :timestamp
    add_column :instances, :provision_name, :string
    add_column :instances, :is_deleted, :boolean
    add_column :instances, :instance_version, :string
    add_column :instances, :connection_string, :string
  end
end
