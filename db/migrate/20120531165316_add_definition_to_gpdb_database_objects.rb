class AddDefinitionToGpdbDatabaseObjects < ActiveRecord::Migration
  def change
    add_column :gpdb_database_objects, :definition, :text
  end
end
