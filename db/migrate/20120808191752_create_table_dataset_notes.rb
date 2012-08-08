class CreateTableDatasetNotes < ActiveRecord::Migration
  def change
    create_table :datasets_notes do |t|
      t.integer :dataset_id
      t.integer :note_id
    end
  end
end
