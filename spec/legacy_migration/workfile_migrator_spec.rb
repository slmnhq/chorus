require 'legacy_migration_spec_helper'

describe WorkfileMigrator do
  describe ".migrate" do
    before :all do
      any_instance_of(WorkfileMigrator::LegacyFilePath) do |p|
        # Stub everything with a PNG so paperclip doesn't blow up
        stub(p).path { File.join(Rails.root, "spec/fixtures/small2.png") }
      end

      WorkfileMigrator.new.migrate
    end

    def should_be_equal_dates(date1, date2_str)
      date1.should == DateTime.parse(date2_str)
    end

    describe "validate the number of entries copied" do
      it "creates a workfile for every legacy workfile, including deleted ones" do
        legacy_workfiles = Legacy.connection.select_all("select * from edc_work_file")
        Workfile.unscoped.count.should == legacy_workfiles.length
      end

      it "creates a workfile draft for every legacy draft, including deleted ones" do
        legacy_drafts = Legacy.connection.select_all("select * from edc_workfile_draft WHERE is_deleted = 'f'")
        WorkfileDraft.count.should == legacy_drafts.length
      end

      it "creates a workfile version for every legacy version, including deleted ones" do
        legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version")
        WorkfileVersion.unscoped.count.should == legacy_versions.length
      end
    end

    describe "copying the data" do
      before :each do
        @legacy_workfiles = Legacy.connection.select_all("select wf.* from edc_work_file wf, edc_workspace ws where wf.workspace_id = ws.id AND ws.is_deleted = 'f';")
        @legacy_drafts = Legacy.connection.select_all("select * from edc_workfile_draft WHERE is_deleted = 'f'")
        @legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version")
      end

      it "associates new workfiles with the appropriate workspace" do
        @legacy_workfiles.each do |legacy_workfile|
          legacy_workspace = Legacy.connection.select_one("select * from edc_workspace where id = '#{legacy_workfile["workspace_id"]}'")
          new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
          Workspace.unscoped.find_by_id(new_workfile.workspace_id).legacy_id.should == legacy_workspace["id"]
        end
      end

      it "associates new workfiles with the appropriate owner" do
        @legacy_workfiles.each do |legacy_workfile|
          legacy_owner = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_workfile["owner"]}'")
          new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
          new_workfile.owner.legacy_id.should == legacy_owner["id"]
        end
      end

      it "copies the interesting fields" do
        @legacy_workfiles.each do |legacy_workfile|
          new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
          new_workfile.description.should == legacy_workfile["description"]
          new_workfile.file_name.should == legacy_workfile["file_name"]
          should_be_equal_dates(new_workfile.created_at, legacy_workfile["created_tx_stamp"])

          # TODO bug????
          #should_be_equal_dates(new_workfile.updated_at, legacy_workfile["last_updated_tx_stamp"])
        end
      end

      it "copies the deleted flag" do
        @legacy_workfiles.each do |legacy_workfile|
          new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
          if legacy_workfile["is_deleted"] == 't'
            should_be_equal_dates(new_workfile.deleted_at, legacy_workfile["last_updated_tx_stamp"])
          elsif legacy_workfile["is_deleted"] == 'f'
            new_workfile.deleted_at.should be_nil
          else
            fail "Unrecognized workfile state"
          end
        end
      end

      describe "versions" do
        it "migrates all versions from the legacy database" do
          @legacy_workfiles.each do |legacy_workfile|
            new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
            legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version WHERE workfile_id = '#{legacy_workfile["id"]}'")
            new_workfile.versions.count.should == legacy_versions.length
          end
        end

        it "associates new versions with the appropriate workfile" do
          @legacy_versions.each do |legacy_version|
            legacy_workfile = Legacy.connection.select_one("select * from edc_work_file where id = '#{legacy_version["workfile_id"]}'")
            new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
            new_version = WorkfileVersion.find_by_legacy_id(legacy_version["id"])
            new_workfile.legacy_id.should == legacy_workfile["id"]
          end
        end

        it "associates the new version with the appropriate owner and modifier" do
          @legacy_versions.each do |legacy_version|
            legacy_owner = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_version["version_owner"]}'")
            legacy_modifier = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_version["modified_by"]}'")

            new_owner = User.unscoped.find_by_legacy_id(legacy_owner["id"])
            new_modifier = User.unscoped.find_by_legacy_id(legacy_modifier["id"])

            new_version = WorkfileVersion.find_by_legacy_id(legacy_version["id"])

            new_version.owner_id.should == new_owner.id
            new_version.modifier_id.should == new_modifier.id
          end
        end

        it "copies the interesting fields" do
          @legacy_versions.each do |legacy_version|
            new_version = WorkfileVersion.find_by_legacy_id(legacy_version["id"])
            new_version.commit_message.should == legacy_version["commit_message"]
            new_version.version_num.should == legacy_version["version_num"].to_i
            should_be_equal_dates(new_version.created_at, legacy_version["created_tx_stamp"])
            should_be_equal_dates(new_version.updated_at, legacy_version["last_updated_tx_stamp"])
          end
        end

        it "attaches the legacy workfile version content to the new workfile version model" do
          @legacy_versions.each do |legacy_version|
            new_version = WorkfileVersion.find_by_legacy_id(legacy_version["id"])
            new_version.contents_file_name.should == Workfile.unscoped.find(new_version.workfile_id).file_name
          end
        end
      end

      describe "draft" do
        it "migrates non-deleted drafts" do
          @legacy_workfiles.each do |legacy_workfile|
            new_workfile = Workfile.unscoped.find_by_legacy_id(legacy_workfile["id"])
            legacy_drafts = Legacy.connection.select_all("select * from edc_workfile_draft WHERE workfile_id = '#{legacy_workfile["id"]}' AND is_deleted = 'f'")
            new_workfile.drafts.count.should == legacy_drafts.length
          end
        end

        it "associates new drafts with the appropriate workfile" do
          @legacy_drafts.each do |legacy_draft|
            legacy_workfile = Legacy.connection.select_one("select * from edc_work_file where id = '#{legacy_draft["workfile_id"]}'")
            new_draft = WorkfileDraft.find_by_legacy_id(legacy_draft["id"])
            new_draft.workfile.legacy_id.should == legacy_workfile["id"]
          end
        end

        it "associates the new draft with the appropriate owner" do
          @legacy_drafts.each do |legacy_draft|
            legacy_owner = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_draft["draft_owner"]}'")
            new_owner = User.unscoped.find_by_legacy_id(legacy_owner["id"])
            new_draft = WorkfileDraft.find_by_legacy_id(legacy_draft["id"])
            new_draft.owner_id.should == new_owner.id
          end
        end

        it "copies the interesting fields" do
          @legacy_drafts.each do |legacy_draft|
            new_draft = WorkfileDraft.find_by_legacy_id(legacy_draft["id"])
            new_draft.base_version.should == legacy_draft["base_version_num"].to_i
            should_be_equal_dates(new_draft.created_at, legacy_draft["created_tx_stamp"])
            should_be_equal_dates(new_draft.updated_at, legacy_draft["last_updated_tx_stamp"])
          end
        end

        it "attaches the legacy workfile draft content to the new workfile draft model" do
          @legacy_drafts.each do |legacy_draft|
            new_draft = WorkfileDraft.find_by_legacy_id(legacy_draft["id"])
            new_draft.content.should be_present
          end
        end
      end
    end
  end
end
