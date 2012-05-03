class AddStateToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :state, :string, :default => "offline"
  end
end
