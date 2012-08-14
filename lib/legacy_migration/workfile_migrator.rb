require 'stringio'

class WorkfileMigrator
  def migrate
    legacy_workfiles = Legacy.connection.select_all("SELECT * from edc_work_file")
    legacy_workfiles.each do |legacy_workfile|
      legacy_owner = Legacy.connection.select_one("SELECT * from edc_user WHERE user_name = '#{legacy_workfile["owner"]}'")
      new_workfile = Workfile.new
      new_workfile.workspace = Workspace.find_by_legacy_id(legacy_workfile["workspace_id"])

      new_workfile.owner_id = legacy_owner["chorus_rails_user_id"]
      new_workfile.description = legacy_workfile["description"]
      new_workfile.created_at = legacy_workfile["created_stamp"]
      new_workfile.file_name  = legacy_workfile["file_name"]
      new_workfile.updated_at = legacy_workfile["last_updated_stamp"]
      new_workfile.deleted_at = legacy_workfile["last_updated_stamp"] if legacy_workfile["is_deleted"] == "t"
      new_workfile.save!

      legacy_versions = Legacy.connection.select_all("SELECT * from edc_workfile_version WHERE workfile_id = '#{legacy_workfile["id"]}'")
      legacy_versions.each do |legacy_version|
        legacy_owner = Legacy.connection.select_one("SELECT * from edc_user WHERE user_name = '#{legacy_version["version_owner"]}'")
        legacy_modifier = Legacy.connection.select_one("SELECT * from edc_user WHERE user_name = '#{legacy_version["modified_by"]}'")
        new_version = WorkfileVersion.new
        new_version.workfile_id = new_workfile.id
        new_version.version_num = legacy_version["version_num"]
        new_version.owner_id = legacy_owner["chorus_rails_user_id"]
        new_version.modifier_id = legacy_modifier["chorus_rails_user_id"]
        new_version.created_at = legacy_version["created_stamp"]
        new_version.updated_at = legacy_version["last_updated_stamp"]

        path = File.join(Chorus::Application.config.legacy_chorus_root_path, "ofbiz", "runtime", "data", "workfile", legacy_workfile["workspace_id"], legacy_version["version_file_id"])
        new_version.contents = StringIO.new(File.read(path))

        new_version.save!

        id = legacy_version["id"]
        Legacy.connection.update("Update edc_workfile_version SET chorus_rails_workfile_version_id = #{new_version.id} WHERE id = '#{id}'")

        new_workfile.updated_at = legacy_workfile["last_updated_stamp"]
        new_workfile.save!
      end

      legacy_drafts = Legacy.connection.select_all("SELECT * from edc_workfile_draft WHERE workfile_id = '#{legacy_workfile["id"]}' AND is_deleted = 'f'")
      legacy_drafts.each do |legacy_draft|
        legacy_owner = Legacy.connection.select_one("SELECT * from edc_user WHERE user_name = '#{legacy_draft["draft_owner"]}'")
        new_draft = WorkfileDraft.new
        new_draft.workfile_id = new_workfile.id
        new_draft.base_version = legacy_draft["base_version_num"]
        new_draft.owner_id = legacy_owner["chorus_rails_user_id"]
        new_draft.created_at = legacy_draft["created_stamp"]
        new_draft.updated_at = legacy_draft["last_updated_stamp"]

        path = File.join(Chorus::Application.config.legacy_chorus_root_path, "ofbiz", "runtime", "data", "workfile", legacy_workfile["workspace_id"], legacy_draft["draft_file_id"])
        new_draft.content = StringIO.new(File.read(path))

        new_draft.save!

        id = legacy_draft["id"]
        Legacy.connection.update("Update edc_workfile_draft SET chorus_rails_workfile_draft_id = #{new_draft.id} WHERE id = '#{id}'")
      end

      id = legacy_workfile["id"]
      Legacy.connection.update("Update edc_work_file SET chorus_rails_workfile_id = #{new_workfile.id} WHERE id = '#{id}'")
    end
  end
end

