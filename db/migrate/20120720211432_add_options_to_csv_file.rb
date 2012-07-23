class AddOptionsToCsvFile < ActiveRecord::Migration
  def change
    add_column :csv_files, :header, :boolean
    add_column :csv_files, :column_names, :text
    add_column :csv_files, :types, :text
    add_column :csv_files, :to_table, :string
    add_column :csv_files, :delimiter, :string
    add_column :csv_files, :user_id, :integer
  end
end
