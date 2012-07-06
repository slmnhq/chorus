require 'spec_helper'

describe NoteCommentMigrator, :data_migration => true, :type => :data_migration do
  before do
    UserMigrator.new.migrate
    InstanceMigrator.new.migrate
  end

  describe ".migrate" do
    it "changes the number of notes" do
      expect { NoteCommentMigrator.new.migrate }.to change(Events::Note, :count)
    end

    it "should migrate the Notes on Greenplum Instance to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_GREENPLUM_INSTANCE.count.should == 5
      Legacy.connection.select_all("SELECT * FROM edc_comment where entity_type = 'instance' and is_deleted = false").each do |legacy_comment|
        note = Events::NOTE_ON_GREENPLUM_INSTANCE.find(legacy_comment["chorus_rails_event_id"])
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
      end
    end

    it "should migrate the Notes on HDFS files to the new database" do
      NoteCommentMigrator.new.migrate
      Events::NOTE_ON_HDFS_FILE.count.should == 6
      Legacy.connection.select_all("SELECT * FROM edc_comment where entity_type = 'hdfs' and is_deleted = false").each do |legacy_comment|
        note = Events::NOTE_ON_HDFS_FILE.find(legacy_comment["chorus_rails_event_id"])
        note.body.should == legacy_comment["body"]
        note.created_at.should == legacy_comment["created_stamp"]
      end
    end
  end
end
