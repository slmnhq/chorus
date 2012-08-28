class RenameImportRelatedRowLimitsToSampleCounts < ActiveRecord::Migration
  def change
    rename_column :import_schedules, :row_limit, :sample_count
    rename_column :imports, :row_limit, :sample_count
  end
end
