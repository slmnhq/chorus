class SandboxMigrator < AbstractMigrator
  class << self
    def prerequisites
      WorkspaceMigrator.migrate
      DatabaseObjectMigrator.migrate
    end

    def classes_to_validate
      []
    end

    def migrate
      prerequisites

      Legacy.connection.exec_query(
        "UPDATE public.workspaces SET sandbox_id = schema.id
         FROM edc_sandbox sandbox
          INNER JOIN gpdb_schemas schema
            ON sandbox.schema_name = schema.name
          INNER JOIN gpdb_databases database
            ON sandbox.database_name = database.name
            AND database.id = schema.database_id
          INNER JOIN gpdb_instances gpdb_instance
            ON gpdb_instance.legacy_id = sandbox.instance_id
            AND database.gpdb_instance_id = gpdb_instance.id
        WHERE sandbox.workspace_id = workspaces.legacy_id;")
    end
  end
end
