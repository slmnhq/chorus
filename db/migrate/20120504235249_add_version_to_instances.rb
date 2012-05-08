class AddVersionToInstances < ActiveRecord::Migration
  def change
    add_column :instances, :version, :string
  end
end
