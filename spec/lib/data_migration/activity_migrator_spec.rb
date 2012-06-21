require 'spec_helper'

describe ActivityMigrator, :type => :data_migration do
  describe ".migrate" do
    before do
      UserMigrator.new.migrate
      WorkspaceMigrator.new.migrate
      InstanceMigrator.new.migrate
      HadoopInstanceMigrator.new.migrate
      WorkfileMigrator.new.migrate
    end

    context "importing data" do
      before do
        ActivityMigrator.new.migrate
      end

      it "creates new events for all legacy activities" do
        Events::Base.count.should > 0
      end

      it "copies WORKFILE CREATED data fields from the legacy activity" do
        legacy_activity_stream = Legacy::ActivityStream.find('10010')
        event = Events::WORKFILE_CREATED.find(legacy_activity_stream.chorus_rails_event_id)

        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.workfile.should be_instance_of(Workfile)
      end

      it "copies INSTANCE CREATED (greenplum) data fields from the legacy activity" do
        legacy_activity_stream = Legacy::ActivityStream.find('10036')
        event = Events::GREENPLUM_INSTANCE_CREATED.find(legacy_activity_stream.chorus_rails_event_id)

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.greenplum_instance.should be_instance_of(Instance)
      end

      it "copies INSTANCE CREATED (hadoop) data fields from the legacy activity" do
        legacy_activity_stream = Legacy::ActivityStream.find('10006')
        event = Events::HADOOP_INSTANCE_CREATED.find(legacy_activity_stream.chorus_rails_event_id)

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.hadoop_instance.should be_instance_of(HadoopInstance)
      end
    end

    context "foreign key" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_false
        ActivityMigrator.new.migrate
      end

      it "adds the new foreign key column to legacy table" do
        Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_true
      end

      it "sets the Event id when successfully imported" do
        Legacy::ActivityStream.where('chorus_rails_event_id IS NOT NULL').exists?.should be_true
      end
    end
  end
end

