require 'spec_helper'

describe ActivityStreamEventMapper, :legacy_migration => true, :type => :legacy_migration do
  let(:mapper) { described_class.new(activity_stream) }

  describe "hadoop instance created event" do
    let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type { 'INSTANCE_CREATED' }
        mock(activity).instance_hadoop? { true }
      end
    end

    context "#build_event" do
      before do
        mock(activity_stream).rails_hadoop_instance_id { hadoop_instance.id }
      end

      it "builds a valid HADOOP_INSTANCE_CREATED event" do
        event = mapper.build_event
        event.should be_a_kind_of(Events::HADOOP_INSTANCE_CREATED)
      end

      it "sets the hadoop instance target" do
        event = mapper.build_event
        event.hadoop_instance.should == hadoop_instance
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "greenplum instance created event" do
    let(:greenplum_instance) { FactoryGirl.create(:instance) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type { 'INSTANCE_CREATED' }
        mock(activity).instance_hadoop? { false }
      end
    end

    context "#build_event" do
      before do
        mock(activity_stream).rails_greenplum_instance_id { greenplum_instance.id }
      end

      it "builds a valid GREENPLUM_INSTANCE_CREATED event" do
        event = mapper.build_event
        event.should be_a_kind_of(Events::GREENPLUM_INSTANCE_CREATED)
      end

      it "sets the greenplum instance target" do
        event = mapper.build_event
        event.greenplum_instance.should == greenplum_instance
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "workfile created event" do
    let(:workfile) { FactoryGirl.create(:workfile) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.twice { 'WORKFILE_CREATED' }
      end
    end

    context "#build_event" do
      before do
        mock(activity_stream).rails_workfile_id { workfile.id }
      end

      it "builds a valid WORKFILE_CREATED event" do
        event = mapper.build_event
        event.should be_a_kind_of(Events::WORKFILE_CREATED)
      end

      it "sets the workfile target" do
        event = mapper.build_event
        event.workfile.should == workfile
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "user added event" do
    let(:user) { FactoryGirl.create(:user) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.twice { 'USER_ADDED' }
      end
    end

    context "#build_event" do
      before do
        mock(activity_stream).rails_object_user_id { user.id }
      end

      it "builds a valid USER_ADDED event" do
        event = mapper.build_event
        event.should be_a_kind_of(Events::USER_ADDED)
      end

      it "sets the user target" do
        event = mapper.build_event
        event.new_user.should == user
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "source table created event" do
    let(:table) { FactoryGirl.create(:gpdb_table) }
    let(:workspace) { FactoryGirl.create(:workspace) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.twice { 'SOURCE_TABLE_CREATED' }
      end
    end

    context "#build_event" do
      before do
        mock(activity_stream).rails_dataset_id { table.id }
      end

      it "builds a valid SOURCE_TABLE_CREATED event" do
        event = mapper.build_event
        event.should be_a_kind_of(Events::SOURCE_TABLE_CREATED)
      end

      it "sets the dataset target" do
        event = mapper.build_event
        event.dataset.should == table
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "instance change owner event" do
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.twice { 'INSTANCE_CHANGED_OWNER' }
      end
    end

    context "#build_event" do
      it "fails to build an event because it is an unexpected type" do
        mapper.build_event.should be_nil
      end
    end

    context "#can_build" do
      it "returns false" do
        mapper.can_build?.should be_false
      end
    end
  end

  describe "instance change name event" do
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.twice { 'INSTANCE_CHANGED_NAME' }
      end
    end

    context "#build_event" do
      it "fails to build an event because it is an unexpected type" do
        mapper.build_event.should be_nil
      end
    end

    context "#can_build" do
      it "returns false" do
        mapper.can_build?.should be_false
      end
    end
  end
end
