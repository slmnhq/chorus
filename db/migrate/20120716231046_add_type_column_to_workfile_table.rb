class AddTypeColumnToWorkfileTable < ActiveRecord::Migration
  def change
    add_column :workfiles, :content_type, :string
  end
end
