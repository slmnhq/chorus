class AddTruncateOptionToCsvFile < ActiveRecord::Migration
  def change
    add_column :csv_files, :truncate, :boolean, :default => false
  end
end
