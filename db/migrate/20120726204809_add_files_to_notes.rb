class AddFilesToNotes < ActiveRecord::Migration
  def change
    create_table :note_attachments do |t|
      t.integer :note_id
      t.string :contents_file_name
      t.timestamps
    end
  end
end
