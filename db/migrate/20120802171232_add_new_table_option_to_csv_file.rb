class AddNewTableOptionToCsvFile < ActiveRecord::Migration
  def change
    rename_column :csv_files, :header, :file_contains_header
    add_column :csv_files, :new_table, :boolean
  end
end
