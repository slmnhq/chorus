class WorkspaceMigrator
  def migrate
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)

    Legacy.connection.exec_query("
      INSERT INTO public.workspaces(
        legacy_id,
        name,
        public,
        archived_at,
        archiver_id,
        summary,
        owner_id,
        deleted_at,
        created_at,
        updated_at)
      SELECT
        edc_workspace.id::integer,
        name,
        CASE is_public
          WHEN 'f' THEN false
          ELSE true
        END,
        archived_timestamp,
        archivers.id,
        summary,
        owners.id,
        CASE is_deleted
          WHEN 't' THEN last_updated_tx_stamp
          ELSE null
        END,
        created_tx_stamp,
        last_updated_tx_stamp
      FROM legacy_migrate.edc_workspace
        LEFT JOIN users archivers ON archivers.username = archiver
        LEFT JOIN users owners ON owners.username = owner;")
  end
end
