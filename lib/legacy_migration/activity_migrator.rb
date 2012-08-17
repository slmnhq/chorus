require 'legacy_migration/legacy_activity_stream'

class ActivityMigrator
  def prerequisites
    DatabaseObjectMigrator.new.migrate
    WorkspaceMigrator.new.migrate
    WorkfileMigrator.new.migrate
    SandboxMigrator.new.migrate #workaround for broken composite keys in DATASET_IMPORT activities
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
      ('Events::' || streams.type),
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
    AND streams.id NOT IN (SELECT legacy_id from events);
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
      'Events::FILE_IMPORT_SUCCESS',
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
    AND streams.id NOT IN (SELECT legacy_id from events);
    ))

    backfill_file_import_success_additional_data
  end

  def backfill_file_import_success_additional_data
    Events::FILE_IMPORT_SUCCESS.where('additional_data IS NULL').each do |event|
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
      'Events::FILE_IMPORT_FAILED',
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
    AND streams.id NOT IN (SELECT legacy_id from events);
    ))

    backfill_file_import_failed_additional_data
  end

  def backfill_file_import_failed_additional_data
    Events::FILE_IMPORT_FAILED.where('additional_data IS NULL').each do |event|
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
    'Events::DATASET_IMPORT_SUCCESS',
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
  AND streams.id NOT IN (SELECT legacy_id from events);
  ))

    backfill_dataset_import_success_additional_data
  end

  def backfill_dataset_import_success_additional_data
    Events::DATASET_IMPORT_SUCCESS.where('additional_data IS NULL').each do |event|
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
    'Events::DATASET_IMPORT_FAILED',
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
  AND streams.id NOT IN (SELECT legacy_id from events);
  ))

    backfill_dataset_import_failed_additional_data
  end

  def backfill_dataset_import_failed_additional_data
    Events::DATASET_IMPORT_FAILED.where('additional_data IS NULL').each do |event|
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
        'Events::PUBLIC_WORKSPACE_CREATED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::PRIVATE_WORKSPACE_CREATED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::WORKSPACE_ARCHIVED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::WORKSPACE_UNARCHIVED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::WORKSPACE_MAKE_PUBLIC',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::WORKSPACE_MAKE_PRIVATE',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::WORKFILE_CREATED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::GREENPLUM_INSTANCE_CREATED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::HADOOP_INSTANCE_CREATED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::USER_ADDED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
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
        'Events::MEMBERS_ADDED',
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
      AND streams.id NOT IN (SELECT legacy_id from events);
      ))

    backfill_member_added_additional_data
  end

  def backfill_member_added_additional_data
    Events::MEMBERS_ADDED.where('additional_data IS NULL').each do |event|
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

  def migrate
    ActiveRecord::Base.record_timestamps = false

    prerequisites

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

    ActiveRecord::Base.record_timestamps = true
  end

  def find_actor(activity_stream)
    user_id = activity_stream.user_id
    actor = user_id.present? ? User.find_with_destroyed(user_id) : nil

    # ?????????? wat is this
    if actor.nil? && activity_stream.type == 'WORKSPACE_ADD_HDFS_AS_EXT_TABLE'
      user_id = activity_stream.author_id
      actor = user_id.present? ? User.find_with_destroyed(user_id) : nil
    end

    actor
  end
end
