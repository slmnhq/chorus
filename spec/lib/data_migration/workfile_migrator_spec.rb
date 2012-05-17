require 'spec_helper'

describe WorkfileMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate
        WorkfileMigrator.new.migrate
        @legacy_workfiles = Legacy.connection.select_all("select * from edc_work_file WHERE is_deleted = 'f'")
        @legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version WHERE is_deleted = 'f'")
      end

      it "creates a workfile for every non-deleted legacy workfile" do
        @legacy_workfiles.select { |w| w["is_deleted"] == 'f' }.length.should == Workfile.count
      end

      it "saves the id of the new workfile on the legacy workfile" do
        @legacy_workfiles.each do |legacy_workfile|
          id = legacy_workfile["chorus_rails_workfile_id"]
          id.should be_present
          Workfile.find_by_id(id).should be_present
        end
      end

      it "associates new workfiles with the appropriate workspace" do
        @legacy_workfiles.each do |legacy_workfile|
          legacy_workspace = Legacy.connection.select_one("select * from edc_workspace where id = '#{legacy_workfile["workspace_id"]}'")
          new_workfile = Workfile.find(legacy_workfile["chorus_rails_workfile_id"])
          new_workfile.workspace.id.should == legacy_workspace["chorus_rails_workspace_id"].to_i
        end
      end

      it "associates new workfiles with the appropriate owner" do
        @legacy_workfiles.each do |legacy_workfile|
          legacy_owner = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_workfile["owner"]}'")
          new_workfile = Workfile.find(legacy_workfile["chorus_rails_workfile_id"])
          new_workfile.owner.id.should == legacy_owner["chorus_rails_user_id"].to_i
        end
      end

      it "copies the interesting fields" do
        @legacy_workfiles.each do |legacy_workfile|
          new_workfile = Workfile.find(legacy_workfile["chorus_rails_workfile_id"])
          new_workfile.description.should == legacy_workfile["description"]
          new_workfile.created_at.should == DateTime.parse(legacy_workfile["created_stamp"])
          new_workfile.updated_at.should == DateTime.parse(legacy_workfile["last_updated_stamp"])
        end
      end

      describe "versions" do
        it "migrates non-deleted versions" do
          @legacy_workfiles.each do |legacy_workfile|
            new_workfile = Workfile.find(legacy_workfile["chorus_rails_workfile_id"])
            legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version WHERE workfile_id = '#{legacy_workfile["id"]}' AND is_deleted = 'f'")
            new_workfile.versions.count.should == legacy_versions.length
          end
        end

        it "saves the id of the new workfile version on the legacy workfile version" do
          legacy_versions = Legacy.connection.select_all("select * from edc_workfile_version WHERE is_deleted = 'f'")
          legacy_versions.each do |legacy_version|
            legacy_version["chorus_rails_workfile_version_id"].should be_present
          end
        end

        it "associates new versions with the appropriate workfile" do
          @legacy_versions.each do |legacy_version|
            legacy_workfile = Legacy.connection.select_one("select * from edc_work_file where id = '#{legacy_version["workfile_id"]}'")
            new_workfile = Workfile.find(legacy_workfile["chorus_rails_workfile_id"])
            new_version = WorkfileVersion.find(legacy_version["chorus_rails_workfile_version_id"])
            new_version.workfile.id.should == legacy_workfile["chorus_rails_workfile_id"].to_i
          end
        end

        it "associates the new version with the appropriate owner and modifier" do
          @legacy_versions.each do |legacy_version|
            legacy_owner = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_version["version_owner"]}'")
            legacy_modifier = Legacy.connection.select_one("select * from edc_user where user_name = '#{legacy_version["modified_by"]}'")

            new_owner = User.find(legacy_owner["chorus_rails_user_id"])
            new_modifier = User.find(legacy_modifier["chorus_rails_user_id"])

            new_version = WorkfileVersion.find(legacy_version["chorus_rails_workfile_version_id"])

            new_version.owner_id.should == new_owner.id
            new_version.modifier_id.should == new_modifier.id
          end
        end

        it "copies the interesting fields" do
          @legacy_versions.each do |legacy_version|
            new_version = WorkfileVersion.find(legacy_version["chorus_rails_workfile_version_id"])
            new_version.commit_message.should == legacy_version["commit_message"]
            new_version.version_num.should == legacy_version["version_num"].to_i
            new_version.created_at.should == DateTime.parse(legacy_version["created_stamp"])
            new_version.updated_at.should == DateTime.parse(legacy_version["last_updated_stamp"])
          end
        end

        it "attaches the legacy workfile version content to the new workfile version model" do
          @legacy_versions.each do |legacy_version|
            new_version = WorkfileVersion.find(legacy_version["chorus_rails_workfile_version_id"])
            new_version.contents_file_name.should be_present
          end
        end
      end
    end
  end
end
