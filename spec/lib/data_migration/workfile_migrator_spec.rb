require 'spec_helper'

describe WorkfileMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        WorkspaceMigrator.new.migrate
        WorkfileMigrator.new.migrate
        @legacy_workfiles = Legacy.connection.select_all("select * from edc_work_file WHERE is_deleted = 'f'")
      end

      it "creates a workfile for every non-deleted legacy workfile" do
        @legacy_workfiles.select {|w| w["is_deleted"] == 'f'}.length.should == Workfile.count
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
    end
  end
end
