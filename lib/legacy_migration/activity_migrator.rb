class ActivityMigrator < AbstractMigrator
  class << self
    def prerequisites
      DatabaseObjectMigrator.migrate
      WorkspaceMigrator.migrate
      WorkfileMigrator.migrate
      SandboxMigrator.migrate #workaround for broken composite keys in DATASET_IMPORT activities
      ensure_legacy_id :events
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
          Events::WorkfileUpgradedVersion
      ]
    end

    def migrate_source_table_created
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'Events::SourceTableCreated',
        datasets.id,
        'Dataset',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_dataset
          ON streams.id = target_dataset.activity_stream_id AND target_dataset.object_type = 'object'
        INNER JOIN datasets
          ON normalize_key(target_dataset.object_id) = datasets.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
        action,
        target2_id,
        target2_type,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'Events::FileImportSuccess',
        datasets.id,
        'Dataset',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_dataset
          ON streams.id = target_dataset.activity_stream_id
          AND target_dataset.entity_type = 'databaseObject'
        INNER JOIN datasets
          ON normalize_key(target_dataset.object_id) = datasets.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
        action,
        created_at,
        updated_at,
        workspace_id,
        actor_id)
      SELECT
        streams.id,
        'Events::FileImportFailed',
        streams.created_tx_stamp,
        streams.last_updated_tx_stamp,
        workspaces.id,
        users.id
      FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
      action,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'Events::DatasetImportSuccess',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM legacy_migrate.edc_activity_stream streams
      INNER JOIN legacy_migrate.edc_activity_stream_object target_dataset
        ON streams.id = target_dataset.activity_stream_id
        AND target_dataset.entity_type = 'table'
      INNER JOIN datasets
        ON normalize_key(target_dataset.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
        row = Legacy.connection.exec_query("SELECT object_name, object_id FROM legacy_migrate.edc_activity_stream_object aso
                                      WHERE aso.activity_stream_id = '#{event.legacy_id}'
                                      AND aso.entity_type = 'table';").first
        event.additional_data = {:source_dataset_id => Dataset.find_by_legacy_id(DatabaseObjectMigrator.normalize_key(row['object_id'])).id}
        event.save!
      end
    end

    def migrate_dataset_import_failed
      Legacy.connection.exec_query(%Q(
    INSERT INTO events(
      legacy_id,
      action,
      target2_id,
      target2_type,
      created_at,
      updated_at,
      workspace_id,
      actor_id)
    SELECT
      streams.id,
      'Events::DatasetImportFailed',
      datasets.id,
      'Dataset',
      streams.created_tx_stamp,
      streams.last_updated_tx_stamp,
      workspaces.id,
      users.id
    FROM legacy_migrate.edc_activity_stream streams
      INNER JOIN legacy_migrate.edc_activity_stream_object target_dataset
        ON streams.id = target_dataset.activity_stream_id
        AND target_dataset.entity_type = 'table'
      INNER JOIN datasets
        ON normalize_key(target_dataset.object_id) = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          FROM legacy_migrate.edc_task et
          INNER JOIN legacy_migrate.edc_activity_stream_object aso
            ON et.id = aso.object_id
            AND aso.object_type = 'object' AND aso.entity_type = 'task'
          WHERE aso.activity_stream_id = '#{event.legacy_id}';
        ").first
        if row.present?
          event.additional_data[:error_message] = row['error_message']
        else
          event.additional_data[:error_message] = ''
        end

        additional_data = Legacy.connection.exec_query("SELECT aso1.object_name as destination_table, aso2.object_id as source_dataset FROM legacy_migrate.edc_activity_stream_object aso1,
                                        legacy_migrate.edc_activity_stream_object aso2
                                        WHERE aso1.activity_stream_id = '#{event.legacy_id}' and aso2.activity_stream_id = '#{event.legacy_id}'
                                        AND aso1.entity_type = 'table' AND aso2.entity_type = 'databaseObject';").first
        event.additional_data[:source_dataset_id] = Dataset.find_by_legacy_id(DatabaseObjectMigrator.normalize_key(additional_data['source_dataset'])).id
        event.additional_data[:destination_table] = additional_data['destination_table']
        event.save!
      end
    end

    def migrate_public_workspace_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::PublicWorkspaceCreated',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::PrivateWorkspaceCreated',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkspaceArchived',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkspaceUnarchived',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkspaceMakePublic',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkspaceMakePrivate',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkfileCreated',
          workfiles.id,
          'Workfile',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_workfile
          ON streams.id = target_workfile.activity_stream_id AND target_workfile.entity_type = 'workfile'
        INNER JOIN workfiles
          ON target_workfile.object_id = workfiles.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users
          ON users.legacy_id = actor.object_id
        WHERE streams.type = 'WORKFILE_CREATED'
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::WorkfileCreated');
        ))
    end

    def migrate_greenplum_instance_created
      Legacy.connection.exec_query(%Q(
        INSERT INTO events(
          legacy_id,
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'Events::GreenplumInstanceCreated',
          instances.id,
          'Instance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN instances
          ON target_instance.object_id = instances.legacy_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'Events::HadoopInstanceCreated',
          hadoop_instances.id,
          'HadoopInstance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN hadoop_instances
          ON target_instance.object_id = hadoop_instances.legacy_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'Events::UserAdded',
          user_added.id,
          'User',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          actor_user.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_user
          ON streams.id = target_user.activity_stream_id AND target_user.entity_type = 'user'
          AND target_user.object_type = 'object'
        INNER JOIN users user_added
          ON target_user.object_id = user_added.legacy_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::MembersAdded',
          user_added.id,
          'User',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          actor_user.id
        FROM legacy_migrate.edc_activity_stream streams

        INNER JOIN legacy_migrate.edc_activity_stream_object actor
          ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
        INNER JOIN users actor_user
          ON actor_user.legacy_id = actor.object_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object target_user
          ON streams.id = target_user.activity_stream_id AND target_user.entity_type = 'user'
          AND target_user.object_type = 'object'
        INNER JOIN users user_added
          ON target_user.object_id = user_added.legacy_id
        WHERE streams.type = 'MEMBERS_ADDED' AND target_user.object_id IN (SELECT object_id from
          legacy_migrate.edc_activity_stream_object where activity_stream_id = streams.id limit 1 )
        AND streams.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::MembersAdded');
        ))

      backfill_member_added_additional_data
    end

    def backfill_member_added_additional_data
      Events::MembersAdded.where('additional_data IS NULL').each do |event|
        row = Legacy.connection.exec_query("
          SELECT count(*) AS count
          FROM legacy_migrate.edc_activity_stream_object aso
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'Events::ProvisioningFail',
          instances.id,
          'Instance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN instances
          ON target_instance.object_id = instances.legacy_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          actor_id)
        SELECT
          streams.id,
          'Events::ProvisioningSuccess',
          instances.id,
          'Instance',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_instance
          ON streams.id = target_instance.activity_stream_id AND target_instance.entity_type = 'instance'
        INNER JOIN instances
          ON target_instance.object_id = instances.legacy_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          action,
          target1_id,
          target1_type,
          created_at,
          updated_at,
          workspace_id,
          actor_id)
        SELECT
          streams.id,
          'Events::WorkfileUpgradedVersion',
          workfiles.id,
          'Workfile',
          streams.created_tx_stamp,
          streams.last_updated_tx_stamp,
          workspaces.id,
          users.id
        FROM legacy_migrate.edc_activity_stream streams
        INNER JOIN legacy_migrate.edc_activity_stream_object target_workfile
          ON streams.id = target_workfile.activity_stream_id AND target_workfile.entity_type = 'workfile'
        INNER JOIN workfiles
          ON target_workfile.object_id = workfiles.legacy_id
        INNER JOIN workspaces
          ON workspaces.legacy_id = streams.workspace_id
        INNER JOIN legacy_migrate.edc_activity_stream_object actor
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
          SELECT aso.object_id AS version_num, versions.id AS version_id, versions.commit_message
          FROM legacy_migrate.edc_activity_stream_object aso
          INNER JOIN workfile_versions versions ON workfile_id = #{event.target1_id} AND
          versions.version_num = aso.object_id::integer
          WHERE aso.activity_stream_id = '#{event.legacy_id}'
          AND aso.object_type = 'object' AND aso.entity_type = 'version';
        ").first
        event.additional_data = {:version_num => "#{row['version_num']}".to_s,
                                 :version_id => "#{row['version_id']}".to_s,
                                 :commit_message => "#{row['commit_message']}"}
        event.save!
      end
    end

    def migrate
      prerequisites

      ActiveRecord::Base.record_timestamps = false

      migrate_source_table_created
      migrate_file_import_success
      migrate_file_import_failed
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
