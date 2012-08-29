class AddTimeZoneToImportScheduleStartTime < ActiveRecord::Migration
  def up
    execute "ALTER TABLE import_schedules ALTER COLUMN start_datetime TYPE timestamp with time zone"
  end

  def down
    execute "ALTER TABLE import_schedules ALTER COLUMN start_datetime TYPE timestamp without time zone"
  end
end
