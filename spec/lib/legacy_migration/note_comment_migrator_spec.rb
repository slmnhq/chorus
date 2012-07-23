require 'spec_helper'

describe NoteCommentMigrator, :legacy_migration => true, :type => :legacy_migration do
  before do
    UserMigrator.new.migrate
    InstanceMigrator.new.migrate
    HadoopInstanceMigrator.new.migrate
    WorkspaceMigrator.new.migrate
    MembershipMigrator.new.migrate
    WorkfileMigrator.new.migrate
  end

  describe ".migrate" do
    it "changes the number of notes" do
      expect { NoteCommentMigrator.new.migrate }.to change(Events::Note, :count)
    end

    it "should migrate the Notes on Greenplum Instance to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_GREENPLUM_INSTANCE.count.should == 5
      Legacy.connection.select_all("SELECT ec.*, chorus_rails_user_id FROM edc_comment ec,edc_user eu where entity_type = 'instance' and ec.is_deleted = false and ec.author_name = eu.user_name").each do |legacy_comment|
        note = Events::NOTE_ON_GREENPLUM_INSTANCE.find_by_id(legacy_comment["chorus_rails_event_id"])
        next unless note
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(legacy_comment["chorus_rails_user_id"]).id
      end
    end

    it "should migrate the Notes on Hadoop Instance to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_HADOOP_INSTANCE.count.should == 2
      Legacy.connection.select_all("SELECT ec.*, chorus_rails_user_id FROM edc_comment ec,edc_user eu where entity_type = 'instance' and ec.is_deleted = false  and ec.author_name = eu.user_name").each do |legacy_comment|
        note = Events::NOTE_ON_HADOOP_INSTANCE.find_by_id(legacy_comment["chorus_rails_event_id"])
        next unless note
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(legacy_comment["chorus_rails_user_id"]).id
      end
    end

    it "should migrate the Notes on HDFS files to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_HDFS_FILE.count.should == 6
      Legacy.connection.select_all("SELECT ec.*, chorus_rails_user_id FROM edc_comment ec,edc_user eu where entity_type = 'hdfs' and ec.is_deleted = false and ec.author_name = eu.user_name").each do |legacy_comment|
        note = Events::NOTE_ON_HDFS_FILE.find(legacy_comment["chorus_rails_event_id"])
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(legacy_comment["chorus_rails_user_id"]).id
      end
    end

    it "should migrate the Notes on Workspaces to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_WORKSPACE.count.should == 40
      Legacy.connection.select_all("SELECT ec.*, chorus_rails_user_id FROM edc_comment ec,edc_user eu where entity_type = 'workspace' and ec.is_deleted = false and ec.author_name = eu.user_name").each do |legacy_comment|
        note = Events::NOTE_ON_WORKSPACE.find(legacy_comment["chorus_rails_event_id"])
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(legacy_comment["chorus_rails_user_id"]).id
      end
    end

    it "should migrate the Notes on Workfiles to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_WORKFILE.count.should == 5
      Legacy.connection.select_all("SELECT ec.*, chorus_rails_user_id, chorus_rails_workspace_id, chorus_rails_workfile_id FROM edc_comment ec,edc_user eu, edc_workspace ew, edc_work_file ewf where entity_type = 'workfile' and ec.is_deleted = false and ec.author_name = eu.user_name and ew.id = ec.workspace_id and ewf.id = ec.entity_id").each do |legacy_comment|
        note = Events::NOTE_ON_WORKFILE.find(legacy_comment["chorus_rails_event_id"])
        note.body.should == legacy_comment["body"]
        note.workspace.should == Workspace.find_with_destroyed(legacy_comment["chorus_rails_workspace_id"])
        note.workfile.should == Workfile.find_with_destroyed(legacy_comment["chorus_rails_workfile_id"])
        note.created_at.should == legacy_comment["created_stamp"]
        note.updated_at.should == legacy_comment["last_updated_stamp"]
        note.actor_id.should == User.find_with_destroyed(legacy_comment["chorus_rails_user_id"]).id
      end
    end
  end
end
