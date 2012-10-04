class AddTypeToWorkfiles < ActiveRecord::Migration
  def change
    add_column :workfiles, :type, :string, :default => "Workfile", :null => false
  end
end
