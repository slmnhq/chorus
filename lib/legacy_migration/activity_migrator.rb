class ActivityMigrator < AbstractMigrator
  class << self
    def prerequisites(options)
      DatabaseObjectMigrator.migrate
      ChorusViewMigrator.migrate
      WorkspaceMigrator.migrate
      WorkfileMigrator.migrate(options)
      SandboxMigrator.migrate #workaround for broken composite keys in DATASET_IMPORT activities
    end

    def classes_to_validate
      [
          Events::SourceTableCreated,
          Events::FileImportSuccess,
          Events::FileImportFailed,
          Events::DatasetImportSuccess,
          Events::DatasetImportFailed,
          Events::PublicWorkspaceCreated,
          Events::PrivateWorkspaceCreated,
          Events::WorkspaceArchived,
          Events::WorkspaceUnarchived,
          Events::WorkspaceMakePublic,
          Events::WorkspaceMakePrivate,
          Events::WorkfileCreated,
          Events::GreenplumInstanceCreated,
          Events::HadoopInstanceCreated,
          Events::UserAdded,
          Events::MembersAdded,
          Events::ProvisioningFail,
          Events::ProvisioningSuccess,
          Events::WorkfileUpgradedVersion,
          Events::ChorusViewCreated,
          Events::ChorusViewChanged
      ]
    end

    def migrate_source_table_created
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'edc_activity_stream',
        'Events::SourceTableCreated',
        datasets.id,
        'Dataset',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_dataset
          ON streams.id = target_dataset.activity_stream_id AND target_dataset.object_type = 'object'
        INNER JOIN datasets
          ON normalize_key(target_dataset.object_id) = datasets.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
      WHERE streams.type = 'SOURCE_TABLE_CREATED'
      AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::SourceTableCreated');
      ))
    end

    def migrate_file_import_success
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target2_id,
        target2_type,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'edc_activity_stream',
        'Events::FileImportSuccess',
        datasets.id,
        'Dataset',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_dataset
          ON streams.id = target_dataset.activity_stream_id
          AND target_dataset.entity_type = 'databaseObject'
        INNER JOIN datasets
          ON normalize_key(target_dataset.object_id) = datasets.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
      WHERE streams.type = 'IMPORT_SUCCESS' AND streams.indirect_verb = 'of file'
      AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::FileImportSuccess');
      ))

      backfill_file_import_success_additional_data
    end

    def backfill_file_import_success_additional_data
      Events::FileImportSuccess.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("SELECT object_name FROM edc_activity_stream_object
                                        WHERE activity_stream_id = '#{event.legacy_id}'
                                        AND entity_type = 'file';").first
        event.additional_data = {:filename => row['object_name'], :import_type => 'file'}
        event.save!
      end
    end

    def migrate_file_import_failed
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'edc_activity_stream',
        'Events::FileImportFailed',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
      WHERE streams.type = 'IMPORT_FAILED' AND streams.indirect_verb = 'of file'
      AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::FileImportFailed');
      ))

      backfill_file_import_failed_additional_data
    end

    def backfill_file_import_failed_additional_data
      Events::FileImportFailed.where('additional_data IS NULL').each do |event|
        rows = Legacy.connection.exec_query("SELECT object_name, entity_type FROM edc_activity_stream_object
                                        WHERE activity_stream_id = '#{event.legacy_id}';")

        error_message = Legacy.connection.exec_query("SELECT result FROM edc_task
                                                          INNER JOIN edc_activity_stream_object aso
                                                          ON aso.entity_type = 'task' AND aso.object_id = edc_task.id
                                                        WHERE aso.activity_stream_id = '#{event.legacy_id}'").first['result']

        event.additional_data = {:filename => rows.select { |r| r['entity_type'] == 'file' }.first['object_name'],
                                 :import_type => 'file',
                                 :destination_table => rows.select { |r| r['entity_type'] == 'table'}.first['object_name'],
                                 :error_message => error_message}
        event.save!
      end
    end

    def migrate_dataset_import_success
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::DatasetImportSuccess',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object target_dataset
        ON streams.id = target_dataset.activity_stream_id
        AND target_dataset.entity_type = 'table'
      INNER JOIN datasets
        ON normalize_key(target_dataset.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
    WHERE streams.type = 'IMPORT_SUCCESS' AND streams.indirect_verb = 'of dataset'
    AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::DatasetImportSuccess');
    ))

      backfill_dataset_import_success_additional_data
    end

    def backfill_dataset_import_success_additional_data
      Events::DatasetImportSuccess.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("SELECT object_name, object_id FROM edc_activity_stream_object aso
                                      WHERE aso.activity_stream_id = '#{event.legacy_id}'
                                      AND aso.entity_type = 'table';").first
        event.additional_data = {:source_dataset_id => Dataset.unscoped.find_by_legacy_id(DatabaseObjectMigrator.normalize_key(row['object_id'])).id}
        event.save!
      end
    end

    def migrate_dataset_import_failed
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::DatasetImportFailed',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object target_dataset
        ON streams.id = target_dataset.activity_stream_id
        AND target_dataset.entity_type = 'table'
      INNER JOIN datasets
        ON normalize_key(target_dataset.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
    WHERE streams.type = 'IMPORT_FAILED' AND streams.indirect_verb = 'of dataset'
    AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::DatasetImportFailed');
    ))

      backfill_dataset_import_failed_additional_data
    end

    def backfill_dataset_import_failed_additional_data
      Events::DatasetImportFailed.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("
          SELECT et.result AS error_message
          FROM edc_task et
          INNER JOIN edc_activity_stream_object aso
            ON et.id = aso.object_id
            AND aso.object_type = 'object' AND aso.entity_type = 'task'
          WHERE aso.activity_stream_id = '#{event.legacy_id}';
        ").first
        if row.present?
          event.additional_data[:error_message] = row['error_message']
        else
          event.additional_data[:error_message] = ''
        end

        additional_data = Legacy.connection.exec_query("SELECT aso1.object_name as destination_table FROM edc_activity_stream_object aso1
                                        WHERE aso1.activity_stream_id = '#{event.legacy_id}'
                                        AND aso1.entity_type = 'table';").first
        # TODO Remove this line once we have chorus views
        next unless additional_data
        event.additional_data[:destination_table] = additional_data['destination_table']
        event.save!
      end
    end

    def migrate_chorus_view_created_from_workfile
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target1_id,
      target1_type,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::ChorusViewCreated',
      datasets.id,
      'Dataset',
      workfiles.id,
      'Workfile',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object chorus_view
        ON streams.id = chorus_view.activity_stream_id
        AND chorus_view.entity_type = 'chorusView'
      INNER JOIN datasets
        ON normalize_key(chorus_view.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
      INNER JOIN edc_activity_stream_object source_workfile
        ON streams.id = source_workfile.activity_stream_id
        AND source_workfile.entity_type = 'sourceObject'
      INNER JOIN workfiles
        ON source_workfile.object_id = workfiles.legacy_id
    WHERE streams.type = 'CHORUS_VIEW_CREATED' AND source_workfile.object_id NOT LIKE '%|%'
    AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::ChorusViewCreated');
    ))
    end

    def migrate_chorus_view_created_from_dataset
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target1_id,
      target1_type,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::ChorusViewCreated',
      chorus_view_dataset.id,
      'Dataset',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object chorus_view
        ON streams.id = chorus_view.activity_stream_id
        AND chorus_view.entity_type = 'chorusView'
      INNER JOIN datasets chorus_view_dataset
        ON normalize_key(chorus_view.object_id) = chorus_view_dataset.legacy_id
        AND chorus_view_dataset.edc_workspace_id = streams.workspace_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
      INNER JOIN edc_activity_stream_object source_dataset
        ON streams.id = source_dataset.activity_stream_id
        AND source_dataset.entity_type = 'sourceObject'
      INNER JOIN datasets
        ON normalize_key(source_dataset.object_id) = datasets.legacy_id
    WHERE streams.type = 'CHORUS_VIEW_CREATED' AND source_dataset.object_id LIKE '%|%'
    AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::ChorusViewCreated');
    ))
    end

    def migrate_chorus_view_changed
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target1_id,
      target1_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::ChorusViewChanged',
      chorus_view_dataset.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object chorus_view
        ON streams.id = chorus_view.activity_stream_id
        AND chorus_view.entity_type = 'chorusView'
      INNER JOIN datasets chorus_view_dataset
        ON normalize_key(chorus_view.object_id) = chorus_view_dataset.legacy_id
        AND chorus_view_dataset.edc_workspace_id = streams.workspace_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
    WHERE streams.type = 'DATASET_CHANGED_QUERY'
    AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::ChorusViewChanged');
    ))
    end

    def migrate_file_import_created
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      legacy_type,
      action,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'edc_activity_stream',
      'Events::FileImportCreated',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM edc_activity_stream streams
      INNER JOIN edc_activity_stream_object target_dataset
        ON streams.id = target_dataset.activity_stream_id
        AND target_dataset.entity_type = 'table'
      INNER JOIN datasets
        ON normalize_key(target_dataset.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
    WHERE streams.type = 'IMPORT_CREATED' AND streams.indirect_verb = 'of file'
    AND streams.id NOT IN (SELECT legacy_id from events);
    ))

      backfill_file_import_created_additional_data
    end

    def backfill_file_import_created_additional_data

      Events::FileImportCreated.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("SELECT aso1.object_name as file_name, aso2.object_name as table_name FROM edc_activity_stream_object aso1
                                      INNER JOIN edc_activity_stream_object aso2 ON aso2.activity_stream_id  = '#{event.legacy_id}' AND aso2.entity_type = 'table'
                                      WHERE aso1.activity_stream_id = '#{event.legacy_id}'
                                      AND aso1.entity_type = 'file';").first
        event.additional_data = {:filename => row['file_name'], :import_type => 'file', :destination_table => row['table_name']}
        event.save!
      end
    end

    def migrate_public_workspace_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::PublicWorkspaceCreated',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_CREATED'
        AND workspaces.public = true
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::PublicWorkspaceCreated');
        ))
    end

    def migrate_private_workspace_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::PrivateWorkspaceCreated',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_CREATED'
        AND workspaces.public = false
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::PrivateWorkspaceCreated');
        ))
    end

    def migrate_workspace_archived
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkspaceArchived',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_ARCHIVED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkspaceArchived');
        ))
    end

    def migrate_workspace_unarchived
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkspaceUnarchived',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_UNARCHIVED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkspaceUnarchived');
        ))
    end

    def migrate_workspace_make_public
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkspaceMakePublic',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_MAKE_PUBLIC'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkspaceMakePublic');
        ))
    end

    def migrate_workspace_make_private
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkspaceMakePrivate',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKSPACE_MAKE_PRIVATE'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkspaceMakePrivate');
        ))
    end

    def migrate_workfile_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkfileCreated',
          workfiles.id,
          'Workfile',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_workfile
          ON streams.id = target_workfile.activity_stream_id AND target_workfile.entity_type = 'workfile'
        INNER JOIN workfiles
          ON target_workfile.object_id = workfiles.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKFILE_CREATED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkfileCreated');
        ))
    end

    def migrate_dataset_import_created
      Legacy.connection.exec_query(%Q(
  INSERT INTO events(
    legacy_id,
    legacy_type,
    action,
    target2_id,
    target2_type,
    created_at,
    updated_at,
    workspace_id,
    actor_id)
  SELECT
    streams.id,
    'edc_activity_stream',
    'Events::DatasetImportCreated',
    datasets.id,
    'Dataset',
    streams.created_tx_stamp,
    streams.last_updated_tx_stamp,
    workspaces.id,
    users.id
  FROM edc_activity_stream streams
    INNER JOIN edc_activity_stream_object target_dataset
      ON streams.id = target_dataset.activity_stream_id
      AND target_dataset.entity_type = 'table'
    INNER JOIN datasets
      ON normalize_key(target_dataset.object_id) = datasets.legacy_id
    INNER JOIN workspaces
      ON workspaces.legacy_id = streams.workspace_id
    INNER JOIN edc_activity_stream_object actor
      ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
    INNER JOIN users
      ON users.legacy_id = actor.object_id
  WHERE streams.type = 'IMPORT_CREATED' AND streams.indirect_verb = 'of dataset'
  AND streams.id NOT IN (SELECT legacy_id from events);
  ))

      backfill_dataset_import_created_additional_data
    end

    def backfill_dataset_import_created_additional_data
      Events::DatasetImportCreated.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("SELECT object_name, object_id FROM edc_activity_stream_object aso
                                    WHERE aso.activity_stream_id = '#{event.legacy_id}'
                                    AND aso.entity_type = 'table';").first
        event.additional_data = {:source_dataset_id => Dataset.unscoped.find_by_legacy_id(DatabaseObjectMigrator.normalize_key(row['object_id'])).id, :destination_table => row['object_name']}
        event.save!
      end
    end

    def migrate_greenplum_instance_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::GreenplumInstanceCreated',
          gpdb_instances.id,
          'GpdbInstance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN gpdb_instances
          ON target_instance.object_id = gpdb_instances.legacy_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'INSTANCE_CREATED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::GreenplumInstanceCreated');
        ))
    end

    def migrate_hadoop_instance_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::HadoopInstanceCreated',
          hadoop_instances.id,
          'HadoopInstance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN hadoop_instances
          ON target_instance.object_id = hadoop_instances.legacy_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'INSTANCE_CREATED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::HadoopInstanceCreated');
        ))
    end

    def migrate_user_added
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::UserAdded',
          user_added.id,
          'User',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          actor_user.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_user
          ON streams.id = target_user.activity_stream_id AND target_user.entity_type = 'user'
          AND target_user.object_type = 'object'
        INNER JOIN users user_added
          ON target_user.object_id = user_added.legacy_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users actor_user
          ON actor_user.legacy_id = actor.object_id
        WHERE streams.type = 'USER_ADDED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::UserAdded');
        ))
    end

    def migrate_member_added
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::MembersAdded',
          user_added.id,
          'User',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          actor_user.id
        FROM edc_activity_stream streams

        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users actor_user
          ON actor_user.legacy_id = actor.object_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object target_user
          ON streams.id = target_user.activity_stream_id AND target_user.entity_type = 'user'
          AND target_user.object_type = 'object'
        INNER JOIN users user_added
          ON target_user.object_id = user_added.legacy_id
        WHERE streams.type = 'MEMBERS_ADDED' AND target_user.object_id IN (SELECT object_id from
          edc_activity_stream_object where activity_stream_id = streams.id limit 1 )
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::MembersAdded');
        ))

      backfill_member_added_additional_data
    end

    def backfill_member_added_additional_data
      Events::MembersAdded.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("
          SELECT count(*) AS count
          FROM edc_activity_stream_object aso
          WHERE aso.activity_stream_id = '#{event.legacy_id}'
          AND aso.object_type = 'object' AND aso.entity_type = 'user';
        ").first

        event.additional_data = {:num_added => "#{row['count']}".to_s}
        event.save!
      end
    end

    def migrate_provision_failed
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::ProvisioningFail',
          gpdb_instances.id,
          'GpdbInstance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN gpdb_instances
          ON target_instance.object_id = gpdb_instances.legacy_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'PROVISIONING_FAIL'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::ProvisioningFail');
        ))

    end

    def migrate_provision_success
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::ProvisioningSuccess',
          gpdb_instances.id,
          'GpdbInstance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN gpdb_instances
          ON target_instance.object_id = gpdb_instances.legacy_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'PROVISIONING_SUCCESS'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::ProvisioningSuccess');
        ))

    end

    def migrate_workfile_upgrade_success
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          legacy_type,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'edc_activity_stream',
          'Events::WorkfileUpgradedVersion',
          workfiles.id,
          'Workfile',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM edc_activity_stream streams
        INNER JOIN edc_activity_stream_object target_workfile
          ON streams.id = target_workfile.activity_stream_id AND target_workfile.entity_type = 'workfile'
        INNER JOIN workfiles
          ON target_workfile.object_id = workfiles.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKFILE_UPGRADED_VERSION'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkfileUpgradedVersion');
        ))

      backfill_version_additional_data
    end


    def backfill_version_additional_data
      Events::WorkfileUpgradedVersion.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("
          SELECT aso.object_id AS version_num, versions.id AS version_id, versions.commit_message AS commit_message
          FROM edc_activity_stream_object aso
          INNER JOIN workfile_versions versions ON workfile_id = #{event.target1_id} AND
          versions.version_num = aso.object_id::integer
          WHERE aso.activity_stream_id = '#{event.legacy_id}'
          AND aso.object_type = 'object' AND aso.entity_type = 'version';
        ").first
        event.additional_data = {:version_num => "#{row['version_num']}".to_s,
                                 :version_id => "#{row['version_id']}".to_s,
                                 :commit_message => row['commit_message']}
        event.save!
      end
    end

    def migrate(options)
      prerequisites(options)

      ActiveRecord::Base.record_timestamps = false

      migrate_source_table_created
      migrate_file_import_created
      migrate_file_import_success
      migrate_file_import_failed
      migrate_dataset_import_created
      migrate_dataset_import_success
      migrate_dataset_import_failed
      migrate_public_workspace_created
      migrate_private_workspace_created
      migrate_workspace_archived
      migrate_workspace_unarchived
      migrate_workspace_make_public
      migrate_workspace_make_private
      migrate_workfile_created
      migrate_greenplum_instance_created
      migrate_hadoop_instance_created
      migrate_user_added
      migrate_member_added
      migrate_provision_failed
      migrate_provision_success
      migrate_workfile_upgrade_success
      migrate_chorus_view_created_from_workfile
      migrate_chorus_view_created_from_dataset
      migrate_chorus_view_changed

      Events::Base.find_each { |event| event.create_activities }

      ActiveRecord::Base.record_timestamps = true
    end

    def find_actor(activity_stream)
      user_id = activity_stream.user_id
      actor = user_id.present? ? User.find_with_destroyed(user_id) : nil

      # ?????????? wat is this
      if actor.nil? && activity_stream.type == 'WorkspaceAddHdfsAsExtTable'
        user_id = activity_stream.author_id
        actor = user_id.present? ? User.find_with_destroyed(user_id) : nil
      end

      actor
    end
  end
end
