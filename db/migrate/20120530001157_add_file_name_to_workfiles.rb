class AddFileNameToWorkfiles < ActiveRecord::Migration
  def change
    add_column :workfiles, :file_name, :string, :not_null => true
  end
end
