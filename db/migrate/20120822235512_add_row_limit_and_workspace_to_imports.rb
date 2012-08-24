class AddRowLimitAndWorkspaceToImports < ActiveRecord::Migration
  def change
    add_column :import_schedules, :row_limit, :integer
    add_column :imports, :row_limit, :integer
    rename_column :imports, :sandbox_id, :workspace_id
    rename_column :import_schedules, :sandbox_id, :workspace_id
    rename_column :imports, :source_dataset, :source_dataset_id
    rename_column :import_schedules, :source_dataset, :source_dataset_id
    add_column :import_schedules, :last_scheduled_at, :datetime
  end
end
