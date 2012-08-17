require 'stringio'

class WorkfileMigrator < AbstractMigrator
  class FakeFileUpload < StringIO
    attr_accessor :content_type, :original_filename
  end

  class LegacyFilePath
    def initialize(*args)
      @args = args
    end

    def path
      File.join(@args)
    end
  end

  def prerequisites
    UserMigrator.new.migrate
    WorkspaceMigrator.new.migrate
    MembershipMigrator.new.migrate
    ensure_legacy_id :workfiles
    ensure_legacy_id :workfile_versions
    ensure_legacy_id :workfile_drafts
  end

  def silence_activerecord
    ActiveRecord::Base.record_timestamps = false
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
    yield
    ActiveRecord::Base.record_timestamps = true
  end

  def migrate
    prerequisites

    #TODO deal with latest_workfile_version_id, content_type
    Legacy.connection.exec_query("
      INSERT INTO public.workfiles(
        legacy_id,
        workspace_id,
        owner_id,
        description,
        created_at,
        file_name,
        updated_at,
        deleted_at
      )
      SELECT
        edc_work_file.id,
        workspace.id,
        owner.id,
        description,
        created_tx_stamp,
        file_name,
        last_updated_tx_stamp,
        CASE is_deleted
          WHEN 't' THEN last_updated_tx_stamp
          ELSE null
        END
      FROM legacy_migrate.edc_work_file
      INNER JOIN users owner
        ON owner.username = edc_work_file.owner
      INNER JOIN workspaces workspace
        ON workspace.legacy_id = edc_work_file.workspace_id
      WHERE edc_work_file.id NOT IN (SELECT legacy_id FROM workfiles);")

    Legacy.connection.exec_query("
      INSERT INTO public.workfile_versions(
        legacy_id,
        workfile_id,
        version_num,
        owner_id,
        modifier_id,
        created_at,
        updated_at,
        commit_message
      )
      SELECT
        edc_workfile_version.id,
        workfiles.id,
        version_num,
        owner.id,
        modifier.id,
        created_tx_stamp,
        last_updated_tx_stamp,
        commit_message
      FROM legacy_migrate.edc_workfile_version
      INNER JOIN users owner
        ON owner.username = edc_workfile_version.version_owner
      INNER JOIN users modifier
        ON modifier.username = edc_workfile_version.modified_by
      INNER JOIN workfiles
        ON edc_workfile_version.workfile_id = workfiles.legacy_id
      WHERE edc_workfile_version.id NOT IN (SELECT legacy_id FROM workfile_versions);")

    Legacy.connection.exec_query("
      INSERT INTO public.workfile_drafts(
        legacy_id,
        workfile_id,
        base_version,
        owner_id,
        created_at,
        updated_at
      )
      SELECT
        edc_workfile_draft.id,
        workfiles.id,
        base_version_num,
        owner.id,
        created_tx_stamp,
        last_updated_tx_stamp
      FROM legacy_migrate.edc_workfile_draft
      INNER JOIN users owner
        ON owner.username = edc_workfile_draft.draft_owner
      INNER JOIN workfiles
        ON edc_workfile_draft.workfile_id = workfiles.legacy_id
      WHERE is_deleted = 'f'
      AND edc_workfile_draft.id NOT IN (SELECT legacy_id FROM workfile_drafts);")

    silence_activerecord do
      #TODO Optimize this to one query
      WorkfileVersion.where("contents_file_name IS NULL").each do |workfile_version|
        row = Legacy.connection.exec_query("
          SELECT
            version_file_id,
            workspace_id,
            file_name,
            mime_type
          FROM legacy_migrate.edc_workfile_version
          INNER JOIN
            legacy_migrate.edc_work_file
            ON edc_workfile_version.workfile_id = edc_work_file.id
          WHERE edc_workfile_version.id = '#{workfile_version.legacy_id}';
        ").first
        path =  LegacyFilePath.new(Chorus::Application.config.legacy_chorus_root_path, "ofbiz", "runtime", "data", "workfile", row["workspace_id"], row["version_file_id"])
        fake_file = FakeFileUpload.new(File.read(path.path))
        fake_file.original_filename = row['file_name']
        fake_file.content_type = row['mime_type']
        workfile_version.contents = fake_file
        workfile_version.save!
      end

      WorkfileDraft.where("content IS NULL").each do |workfile_draft|
        row = Legacy.connection.exec_query("
          SELECT
            draft_file_id,
            workspace_id
          FROM legacy_migrate.edc_workfile_draft
          INNER JOIN
            legacy_migrate.edc_work_file
            ON edc_workfile_draft.workfile_id = edc_work_file.id
          WHERE edc_workfile_draft.id = '#{workfile_draft.legacy_id}';
        ").first
        path = LegacyFilePath.new(Chorus::Application.config.legacy_chorus_root_path, "ofbiz", "runtime", "data", "workfile", row["workspace_id"], row["draft_file_id"])
        workfile_draft.content = StringIO.new(File.read(path.path))
        workfile_draft.save!
      end
    end
  end
end

