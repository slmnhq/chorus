require "spec_helper"

describe Events::Base do
  describe ".add(params)" do
    it "creates an event with the given parameters" do
      instance1 = FactoryGirl.create(:instance)
      instance2 = FactoryGirl.create(:instance)
      user1 = FactoryGirl.create(:user)
      user2 = FactoryGirl.create(:user)
      user3 = FactoryGirl.create(:user)
      dataset = FactoryGirl.create(:gpdb_table)
      hdfs_file = HdfsFileReference.create({:hadoop_instance_id => 1234, :path => "/path/file.txt"})
      workspace = FactoryGirl.create(:workspace)

      Events::GREENPLUM_INSTANCE_CREATED.by(user1).add(:greenplum_instance => instance1)
      Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(user2).add(:greenplum_instance => instance2, :new_owner => user3)
      Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.by(user1).add(:dataset => dataset, :hdfs_file => hdfs_file, :workspace => workspace)

      event1 = Events::GREENPLUM_INSTANCE_CREATED.first
      event2 = Events::GREENPLUM_INSTANCE_CHANGED_OWNER.first
      event3 = Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.first

      event1.actor.should == user1
      event1.greenplum_instance.should == instance1

      event2.actor.should == user2
      event2.greenplum_instance.should == instance2
      event2.new_owner.should == user3

      event3.workspace.should == workspace
    end
  end

  it "is ordered with the most recent items first, by default" do
    events = Events::Base.limit(2).to_a
    events[0].created_at.should > events[1].created_at
  end

  describe ".for_dashboard_of(user)" do
    let(:user) { users(:alice) }
    let(:the_events) {[
      events(:alice_creates_private_workfile),
      events(:bob_creates_private_workfile),
      events(:bob_creates_public_workfile),
      events(:alice_creates_private_workfile)
    ]
    }

    let(:other_workspace1) { workspaces(:bob_public) }
    let(:other_workspace2) { workspaces(:bob_private) }
    let(:user_workspace) { workspaces(:alice_public) }

    let!(:workspace_activity) { Activity.create!(:entity => user_workspace, :event => the_events[0] ) }

    let!(:other_workspace1_activity) { Activity.create!(:entity => other_workspace1, :event => the_events[1]) }
    let!(:other_workspace2_activity) { Activity.create!(:entity => other_workspace2, :event => the_events[2]) }

    let!(:global_activity) { Activity.global.create!(:event => the_events[3]) }
    let!(:duplicate_global_activity) { Activity.global.create!(:event => the_events[0]) }

    subject { Events::Base.for_dashboard_of(user) }

    it "includes global events" do
      subject.should include(global_activity.event)
    end

    it "includes events for the user's workspaces" do
      subject.should include(workspace_activity.event)
    end

    it "does not include events for other public workspaces" do
      subject.should_not include(other_workspace1_activity.event)
      subject.should_not include(other_workspace2_activity.event)
    end

    it "does not include multiples of the same event" do
      ids = subject.map(&:id)
      ids.should == ids.uniq
    end

    it "can be filtered further (like any activerecord relation)" do
      event = global_activity.event
      subject.find(event.to_param).should == event
    end
  end
end
