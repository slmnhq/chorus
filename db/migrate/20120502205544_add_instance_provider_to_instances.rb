class AddInstanceProviderToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :instance_provider, :string
  end
end
