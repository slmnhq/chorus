class CreateGpdbDatabaseObjects < ActiveRecord::Migration
  def change
    create_table :gpdb_database_objects do |t|
      t.string :type
      t.string :name
      t.text :comment
      t.integer :schema_id

      t.timestamps
    end
  end
end
