class CreateTableNoteWorkfiles < ActiveRecord::Migration
  def change
    create_table :notes_workfiles do |t|
      t.integer :note_id
      t.integer :workfile_id
    end
  end
end
