class RemoveIsActiveFromImportSchedules < ActiveRecord::Migration
  def up
    remove_column :import_schedules, :is_active
  end

  def down
    add_column :import_schedules, :is_active, :boolean, :null => false, :default => true
  end
end
