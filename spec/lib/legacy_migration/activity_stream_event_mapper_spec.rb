require 'spec_helper'

describe ActivityStreamEventMapper, :legacy_migration => true, :type => :legacy_migration do
  let(:mapper) { described_class.new(activity_stream) }

  describe "hadoop instance created event" do
    let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'INSTANCE_CREATED' }
        mock(activity).instance_hadoop?.times(any_times) { true }
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
        mock(activity).type.times(any_times) { 'INSTANCE_CREATED' }
        mock(activity).instance_hadoop?.times(any_times) { false }
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
        mock(activity).type.times(any_times) { 'WORKFILE_CREATED' }
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

  describe "public workspace created event" do
    let!(:workspace) { FactoryGirl.create(:workspace, :public => true) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'WORKSPACE_CREATED' }
        mock(activity).chorus_rails_workspace_id.times(any_times) { workspace.id }
      end
    end

    it "#build_event" do
      event = mapper.build_event
      event.should be_a_kind_of(Events::PUBLIC_WORKSPACE_CREATED)
    end

    it "#can_build?" do
      mapper.can_build?.should be_true
    end
  end

  describe "private workspace created event" do
    let!(:workspace) { FactoryGirl.create(:workspace, :public => false) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'WORKSPACE_CREATED' }
        mock(activity).chorus_rails_workspace_id { workspace.id }
      end
    end

    it "#build_event" do
      event = mapper.build_event
      event.should be_a_kind_of(Events::PRIVATE_WORKSPACE_CREATED)
    end

    it "#can_build?" do
      mapper.can_build?.should be_true
    end
  end

  describe "workspace make public event" do
    let!(:workspace) { FactoryGirl.create(:workspace, :public => true) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'WORKSPACE_MAKE_PUBLIC' }
      end
    end

    it "#build_event" do
      event = mapper.build_event
      event.should be_a_kind_of(Events::WORKSPACE_MAKE_PUBLIC)
    end

    it "#can_build?" do
      mapper.can_build?.should be_true
    end
  end

  describe "workspace make private event" do
    let!(:workspace) { FactoryGirl.create(:workspace, :public => false) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'WORKSPACE_MAKE_PRIVATE' }
      end
    end

    it "#build_event" do
      event = mapper.build_event
      event.should be_a_kind_of(Events::WORKSPACE_MAKE_PRIVATE)
    end

    it "#can_build?" do
      mapper.can_build?.should be_true
    end
  end

  describe "user added event" do
    let(:user) { FactoryGirl.create(:user) }
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'USER_ADDED' }
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
        mock(activity).type.times(any_times) { 'SOURCE_TABLE_CREATED' }
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
        mock(activity).type.times(any_times) { 'INSTANCE_CHANGED_OWNER' }
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
        mock(activity).type.times(any_times) { 'INSTANCE_CHANGED_NAME' }
      end
    end

    context "#can_build" do
      it "returns false" do
        mapper.can_build?.should be_false
      end
    end
  end

  describe "import success event" do
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'IMPORT_SUCCESS' }
      end
    end

    context "#can_build" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "import failed event" do
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'IMPORT_FAILED' }
      end
    end

    context "#can_build" do
      it "returns true" do
        mapper.can_build?.should be_true
      end
    end
  end

  describe "members added event" do
    let(:activity_stream) do
      Object.new.tap do |activity|
        mock(activity).type.times(any_times) { 'MEMBERS_ADDED' }
      end
    end

    context "#build_event" do
      let(:member) { FactoryGirl.create(:user) }
      let(:event) { mapper.build_event }

      before do
        mock(activity_stream).rails_member_id_and_count { [member.id, 3] }
      end

      it "builds a valid MEMBERS_ADDED event" do
        event.should be_a_kind_of(Events::MEMBERS_ADDED)
      end

      it "sets the member target" do
        event.member.should == member
      end

      it "sets the num_added additional data" do
        event.num_added.should == "3"
      end
    end

    context "#can_build?" do
      it "returns true" do
        mapper.should be_can_build
      end
    end
  end
end
