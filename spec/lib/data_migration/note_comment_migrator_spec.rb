 require 'spec_helper'

describe NoteCommentMigrator, :data_migration => true, :type => :data_migration do
  before do
    UserMigrator.new.migrate
    InstanceMigrator.new.migrate
    HadoopInstanceMigrator.new.migrate
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
  end
end
