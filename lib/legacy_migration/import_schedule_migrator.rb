class ImportScheduleMigrator < AbstractMigrator
  class << self
    def prerequisites
      DatabaseObjectMigrator.migrate
      WorkspaceMigrator.migrate
      ensure_legacy_id :import_schedules
    end

    def migrate
      prerequisites

      Legacy.connection.exec_query("
        INSERT INTO public.import_schedules(
          legacy_id,
          start_datetime,
          end_date,
          frequency,
          deleted_at,
          created_at,
          updated_at,
          workspace_id,
          to_table,
          source_dataset_id,
          truncate,
          user_id,
          row_limit
          )
        SELECT
          s.id,
          s.start_time,
          s.end_time,
          CASE frequency
            WHEN 4 THEN 'daily'
            WHEN 5 THEN 'weekly'
            WHEN 6 THEN 'monthly'
          END,
          w.deleted_at,
          s.created_tx_stamp,
          s.last_updated_tx_stamp,
          w.id,
          i.to_table,
          d.id,
          i.truncate,
          u.id,
          sample_count
        FROM edc_import_schedule s
        INNER JOIN edc_import i
          on i.schedule_id = s.id
        INNER JOIN datasets d
          on d.legacy_id = normalize_key(i.source_id)
        INNER JOIN users u
          on u.legacy_id = i.owner_id
        INNER JOIN workspaces w
          on w.legacy_id = i.workspace_id
        WHERE s.id NOT IN (SELECT legacy_id FROM import_schedules);")
    end
  end
end

