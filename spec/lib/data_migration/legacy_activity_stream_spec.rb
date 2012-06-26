require 'spec_helper'

require 'data_migration/legacy_activity_stream'

describe Legacy::ActivityStream, :type => :data_migration do
  let(:greenplum_activity_stream) { Legacy::ActivityStream.new('10000', nil) }
  let(:hadoop_activity_stream) { Legacy::ActivityStream.new('10006', nil) }
  let(:workfile_activity_stream) { Legacy::ActivityStream.new('10010', nil) }
  let(:user_activity_stream) { Legacy::ActivityStream.new('10004', nil) }

  before do
    Legacy.connection.add_column :edc_instance, :chorus_rails_instance_id, :integer
    Legacy.connection.add_column :edc_work_file, :chorus_rails_workfile_id, :integer
    Legacy.connection.add_column :edc_activity_stream, :chorus_rails_event_id, :integer
    Legacy.connection.add_column :edc_user, :chorus_rails_user_id, :integer

    Legacy.connection.update("UPDATE edc_instance SET chorus_rails_instance_id = 123")
    Legacy.connection.update("UPDATE edc_work_file SET chorus_rails_workfile_id = 123")
    Legacy.connection.update("UPDATE edc_user SET chorus_rails_user_id = 123")
  end

  after do
    Legacy.connection.remove_column :edc_instance, :chorus_rails_instance_id
    Legacy.connection.remove_column :edc_work_file, :chorus_rails_workfile_id
    Legacy.connection.remove_column :edc_user, :chorus_rails_user_id
    Legacy.connection.remove_column :edc_activity_stream, :chorus_rails_event_id
  end

  describe "#instance_greenplum?" do
    context "when it has an instance and it is greenplum" do
      it "returns false" do
        greenplum_activity_stream.should be_instance_greenplum
      end
    end

    context "when it has an instance and it is hadoop" do
      it "returns true" do
        hadoop_activity_stream.should_not be_instance_greenplum
      end
    end

    context "when it has no instance" do
      it "returns false" do
        workfile_activity_stream.should_not be_instance_greenplum
      end
    end
  end

  describe "#instance_hadoop?" do
    context "when it has an instance and it is greenplum" do
      it "returns false" do
        greenplum_activity_stream.should_not be_instance_hadoop
      end
    end

    context "when it has an instance and it is hadoop" do
      it "returns true" do
        hadoop_activity_stream.should be_instance_hadoop
      end
    end

    context "when it has no instance" do
      it "returns false" do
        workfile_activity_stream.should_not be_instance_hadoop
      end
    end
  end

  describe "#update_event_id" do
    it "updates activity stream's event id in the legacy database" do
      activity_stream = Legacy::ActivityStream.new('10000', nil)
      activity_stream.update_event_id('9876')

      result = Legacy.connection.exec_query("SELECT 1 FROM edc_activity_stream WHERE chorus_rails_event_id = '9876' AND id = '10000'")
      result.should_not be_empty
    end
  end

  describe "#rails_greenplum_instance_id" do
    context "when it has an instance and it is greenplum" do
      it "returns the ID" do
        greenplum_activity_stream.rails_greenplum_instance_id.should be_present
      end
    end

    context "when it has an instance and it is hadoop" do
      it "returns nil" do
        hadoop_activity_stream.rails_greenplum_instance_id.should_not be_present
      end
    end

    context "when it has no instance" do
      it "returns false" do
        workfile_activity_stream.rails_greenplum_instance_id.should_not be_present
      end
    end
  end

  describe "#rails_hadoop_instance_id" do
    context "when it has an instance and it is greenplum" do
      it "returns false" do
        greenplum_activity_stream.rails_hadoop_instance_id.should_not be_present
      end
    end

    context "when it has an instance and it is hadoop" do
      it "returns the ID" do
        hadoop_activity_stream.rails_hadoop_instance_id.should be_present
      end
    end

    context "when it has no instance" do
      it "returns false" do
        workfile_activity_stream.rails_hadoop_instance_id.should_not be_present
      end
    end
  end

  describe "#rails_workfile_id" do
    context "when it has a workfile" do
      it "returns the workfile id" do
        workfile_activity_stream.rails_workfile_id.should be_present
      end
    end

    context "when it doesn't have a workfile'" do
      it "returns false" do
        greenplum_activity_stream.rails_workfile_id.should_not be_present
      end
    end
  end

  describe "#rails_object_user_id" do
      context "when it has a user" do
        it "returns the user id" do
          user_activity_stream.rails_object_user_id.should be_present
        end
      end

      context "when it doesn't have a user'" do
        it "returns false" do
          greenplum_activity_stream.rails_object_user_id.should_not be_present
        end
      end
    end
end