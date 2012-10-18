class NoteMigrator < AbstractMigrator
  class << self
    def prerequisites(options)
      HdfsEntryMigrator.migrate
      WorkfileMigrator.migrate(options)
      DatabaseObjectMigrator.migrate
      ChorusViewMigrator.migrate
    end

    def classes_to_validate
      [
          Events::NoteOnGreenplumInstance,
          Events::NoteOnHadoopInstance,
          Events::NoteOnHdfsFile,
          Events::NoteOnWorkspace,
          Events::NoteOnWorkfile,
          Events::NoteOnWorkspaceDataset,
          Events::NoteOnDataset
      ]
    end
  
    def migrate(options)
      prerequisites(options)

      migrate_notes_on_gpdb_instances
      migrate_notes_on_hadoop_instances
      migrate_notes_on_hdfs_files
      migrate_notes_on_workspaces
      migrate_notes_on_workfiles
      migrate_notes_on_workspace_datasets
      migrate_notes_on_datasets
      migrate_insights_on_notes
    end
  
    private
  
    def migrate_notes_on_gpdb_instances
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnGreenplumInstance',
        gpdb_instances.id,
        'GpdbInstance',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN edc_instance
          ON edc_instance.id = edc_comment.entity_id
            AND instance_provider = 'Greenplum Database'
        INNER JOIN users
          ON users.username = edc_comment.author_name
        INNER JOIN gpdb_instances
          ON gpdb_instances.legacy_id = edc_comment.entity_id
      WHERE
        edc_comment.entity_type = 'instance'
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnGreenplumInstance');
      ))
  
      copy_note_body_for_class Events::NoteOnGreenplumInstance
    end
  
    def migrate_notes_on_hadoop_instances
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnHadoopInstance',
        hadoop_instances.id,
        'HadoopInstance',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN edc_instance
          ON edc_instance.id = edc_comment.entity_id
            AND instance_provider = 'Hadoop'
        INNER JOIN users
          ON users.username = edc_comment.author_name
        INNER JOIN hadoop_instances
          ON hadoop_instances.legacy_id = edc_comment.entity_id
      WHERE
        edc_comment.entity_type = 'instance'
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnHadoopInstance');
      ))
  
      copy_note_body_for_class Events::NoteOnHadoopInstance
    end
  
    def migrate_notes_on_hdfs_files
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnHdfsFile',
        hdfs_entries.id,
        'HdfsEntry',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN hadoop_instances
          ON hadoop_instances.legacy_id = substring(edc_comment.entity_id from 0 for position('|' in edc_comment.entity_id))
        INNER JOIN hdfs_entries
          ON hdfs_entries.hadoop_instance_id = hadoop_instances.id
            AND hdfs_entries.path = substring(edc_comment.entity_id from position('|' in edc_comment.entity_id) + 1)
        INNER JOIN users
          ON users.username = edc_comment.author_name
      WHERE
        edc_comment.entity_type = 'hdfs'
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnHdfsFile');
      ))
  
      copy_note_body_for_class Events::NoteOnHdfsFile
    end
  
    def migrate_notes_on_workspaces
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        workspace_id,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnWorkspace',
        workspaces.id,
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN workspaces
          ON workspaces.legacy_id = edc_comment.entity_id
        INNER JOIN users
          ON users.username = edc_comment.author_name
      WHERE
        edc_comment.entity_type = 'workspace'
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnWorkspace');
      ))
  
      copy_note_body_for_class Events::NoteOnWorkspace
    end
  
    def migrate_notes_on_workfiles
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnWorkfile',
        workfiles.id,
        'Workfile',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN workfiles
          ON workfiles.legacy_id = edc_comment.entity_id
        INNER JOIN users
          ON users.username = edc_comment.author_name
      WHERE
        edc_comment.entity_type = 'workfile'
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnWorkfile');
      ))
  
      copy_note_body_for_class Events::NoteOnWorkfile
    end
  
    def migrate_notes_on_workspace_datasets
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id,
        workspace_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnWorkspaceDataset',
        datasets.id,
        'Dataset',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id,
        workspaces.id
      FROM
        edc_comment
        INNER JOIN datasets
          ON datasets.legacy_id = normalize_key(edc_comment.entity_id)
        INNER JOIN users
          ON users.username = edc_comment.author_name
        INNER JOIN workspaces
          ON workspaces.legacy_id = edc_comment.workspace_id
      WHERE
        edc_comment.entity_type IN ( 'databaseObject', 'chorusView')
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnWorkspaceDataset');
      ))
  
      copy_note_body_for_class Events::NoteOnWorkspaceDataset
    end
  
    def migrate_notes_on_datasets
      Legacy.connection.exec_query(%Q(
      INSERT INTO events(
        legacy_id,
        legacy_type,
        action,
        target1_id,
        target1_type,
        created_at,
        updated_at,
        deleted_at,
        actor_id)
      SELECT
        edc_comment.id,
        'edc_comment',
        'Events::NoteOnDataset',
        datasets.id,
        'Dataset',
        edc_comment.created_stamp,
        edc_comment.last_updated_stamp,
        CASE edc_comment.is_deleted
          WHEN 't' THEN edc_comment.last_updated_stamp
          ELSE null
        END,
        users.id
      FROM
        edc_comment
        INNER JOIN datasets
          ON datasets.legacy_id = normalize_key(edc_comment.entity_id)
        INNER JOIN users
          ON users.username = edc_comment.author_name
      WHERE
        edc_comment.entity_type = 'databaseObject'
        AND edc_comment.workspace_id IS NULL
        AND edc_comment.id NOT IN (SELECT legacy_id from events WHERE action = 'Events::NoteOnDataset');
      ))
  
      copy_note_body_for_class Events::NoteOnDataset
    end
  
    def copy_note_body_for_class(klass)
      silence_activerecord do
        klass.find_with_destroyed(:all, :conditions => 'additional_data IS NULL').each do |note|
          row = Legacy.connection.exec_query("SELECT body FROM edc_comment
                                          WHERE id = '#{note.legacy_id}'").first
          note.additional_data = {:body => row['body']}
          note.save!(:validate => false)
        end
      end
    end

    def migrate_insights_on_notes
      silence_activerecord do
        Events::Note.unscoped.all.each do |note|
          row = Legacy.connection.exec_query("SELECT is_insight, promotion_time, promotion_actioner, is_published FROM edc_comment
                                          WHERE id = '#{note.legacy_id}'").first
          note.insight = (row['is_insight'] == 't' ? true : false)
          note.promotion_time = row['promotion_time']
          note.promoted_by_id = User.find_with_destroyed(:first, :conditions => {:username => row["promotion_actioner"]}).id if row["promotion_actioner"]
          note.published = (row['is_published'] == 't' ? true : false)
          note.save!
        end
      end
    end
  end
end
