require 'spec_helper'

require 'data_migration/legacy_models'

describe Legacy::ActivityStream, :type => :data_migration  do
  let(:greenplum_activity_stream) { Legacy::ActivityStream.find '10000' }
  let(:hadoop_activity_stream) { Legacy::ActivityStream.find '10006' }
  let(:workfile_activity_stream) { Legacy::ActivityStream.find '10010' }

  describe "#workspace" do
    it "returns the associated workspace" do
      activity_stream = Legacy::ActivityStream.find '10001'

      activity_stream.workspace.should be_instance_of(Legacy::Workspace)
      activity_stream.workspace.name.should == "Workspace"
      activity_stream.workspace.owner.should == "edcadmin"
    end
  end

  describe "#workfile" do
    it "returns the workfile" do
      activity_stream = Legacy::ActivityStream.find '10010'

      activity_stream.workfile.should be_instance_of(Legacy::Workfile)
      activity_stream.workfile.file_name.should == "versions.sql"
    end
  end

  describe "#instance" do
    context "when it's a greenplum instance'" do
      it "returns the greenplum instance" do
        activity_stream = Legacy::ActivityStream.find '10000'

        activity_stream.instance.should be_instance_of(Legacy::Instance)
        activity_stream.instance.name.should == "gillette"
        activity_stream.instance.should be_greenplum
      end
    end

    context "when it's a hadoop instance'" do
      it "returns the hadoop instance" do
        activity_stream = Legacy::ActivityStream.find '10006'

        activity_stream.instance.should be_instance_of(Legacy::Instance)
        activity_stream.instance.name.should == "hadoop"
        activity_stream.instance.should be_hadoop
      end
    end

  end

  describe "#actor" do
    it "returns the workfile" do
      activity_stream = Legacy::ActivityStream.find '10000'

      activity_stream.actor.should be_instance_of(Legacy::User)
      activity_stream.actor.user_name.should == "edcadmin"
    end
  end

  describe "#instance_greenplum?" do
    context "when it has an instance and it is greenplum" do
      it "returns true" do
        greenplum_activity_stream.should be_instance_greenplum
      end
    end

    context "when it has an instance and it is hadoop" do
      it "returns false" do
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

  context "running migrations" do
    before do
      Legacy.connection.add_column :edc_instance, :chorus_rails_instance_id, :integer
      Legacy.connection.add_column :edc_work_file, :chorus_rails_workfile_id, :integer

      Legacy.connection.update("UPDATE edc_instance SET chorus_rails_instance_id = 123")
      Legacy.connection.update("UPDATE edc_work_file SET chorus_rails_workfile_id = 123")
    end

    after do
      Legacy.connection.remove_column :edc_instance, :chorus_rails_instance_id
      Legacy.connection.remove_column :edc_work_file, :chorus_rails_workfile_id
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
  end
end