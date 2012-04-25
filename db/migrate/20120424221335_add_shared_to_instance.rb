class AddSharedToInstance < ActiveRecord::Migration
  def change
    add_column :instances, :shared, :boolean, :default => false
    remove_column :instance_credentials, :shared
  end
end
