require 'legacy_migration/legacy_activity_stream'

class ActivityMigrator
  def prerequisites
    DatabaseObjectMigrator.new.migrate
    WorkspaceMigrator.new.migrate
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
        ON replace(target_dataset.object_id, '"', '') = datasets.legacy_id
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
        ON replace(target_dataset.object_id, '"', '') = datasets.legacy_id
      INNER JOIN workspaces
        ON workspaces.legacy_id = streams.workspace_id
      INNER JOIN legacy_migrate.edc_activity_stream_object actor
        ON streams.id = actor.activity_stream_id AND actor.object_type = 'actor'
      INNER JOIN users
        ON users.legacy_id = actor.object_id
    WHERE streams.type = 'IMPORT_SUCCESS' AND streams.indirect_verb = 'of file'
    AND streams.id NOT IN (SELECT legacy_id from events);
    ))
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

  def migrate
    ActiveRecord::Base.record_timestamps = false
    prerequisites

    migrate_source_table_created
    migrate_file_import_success
    backfill_file_import_success_additional_data
    ActiveRecord::Base.record_timestamps = true

    #
    #
    #Legacy::ActivityStream.all.each do |activity_stream|
    #  mapper = ActivityStreamEventMapper.new(activity_stream)
    #  next unless mapper.can_build?
    #
    #  next unless event = mapper.build_event
    #
    #  event.workspace = find_workspace(activity_stream)
    #  event.actor = find_actor(activity_stream)
    #  event.created_at = activity_stream.created_stamp
    #  event.save!
    #
    #  activity_stream.update_event_id(event.id)
    #end
  end

  private

  def find_workspace(activity_stream)
    workspace_id = activity_stream.chorus_rails_workspace_id
    workspace_id.present? ? Workspace.find_with_destroyed(workspace_id) : nil
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
