class AddUserUploadedFlagToCsvFile < ActiveRecord::Migration
  def change
    add_column :csv_files, :user_uploaded, :boolean, :default => true
  end
end
