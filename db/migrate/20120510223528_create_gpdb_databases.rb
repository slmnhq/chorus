class CreateGpdbDatabases < ActiveRecord::Migration
  def change
    create_table :gpdb_databases do |t|
      t.integer :instance_id
      t.string :name

      t.timestamps
    end
  end
end
