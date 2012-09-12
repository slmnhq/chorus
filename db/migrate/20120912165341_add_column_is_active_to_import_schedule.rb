class AddColumnIsActiveToImportSchedule < ActiveRecord::Migration
  def change
    add_column :import_schedules, :is_active, :boolean, :null => false, :default => true
  end
end
