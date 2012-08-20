class AddExecutionSchemaToWorkfiles < ActiveRecord::Migration
  def change
    add_column :workfiles, :execution_schema_id, :integer
  end
end
