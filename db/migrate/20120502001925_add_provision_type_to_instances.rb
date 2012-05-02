class AddProvisionTypeToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :provision_type, :string
  end
end
