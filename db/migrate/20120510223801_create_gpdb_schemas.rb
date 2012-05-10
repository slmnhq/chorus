class CreateGpdbSchemas < ActiveRecord::Migration
  def change
    create_table :gpdb_schemas do |t|
      t.string :name
      t.integer :database_id

      t.timestamps
    end
  end
end
