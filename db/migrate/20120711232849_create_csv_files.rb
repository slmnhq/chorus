class CreateCsvFiles < ActiveRecord::Migration
  def change
    create_table :csv_files do |t|
      t.references :workspace
      t.string :contents_file_name
      t.string :contents_content_type
      t.integer :contents_file_size
      t.datetime :contents_updated_at

      t.timestamps
    end
    add_index :csv_files, :workspace_id
  end
end
