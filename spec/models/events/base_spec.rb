require "spec_helper"

describe Events::Base do
  describe ".add(params)" do
    it "creates an event with the given parameters" do
      instance1 = FactoryGirl.create(:instance)
      instance2 = FactoryGirl.create(:instance)
      user1 = FactoryGirl.create(:user)
      user2 = FactoryGirl.create(:user)
      user3 = FactoryGirl.create(:user)

      Events::GREENPLUM_INSTANCE_CREATED.by(user1).add(:greenplum_instance => instance1)
      Events::GREENPLUM_INSTANCE_CHANGED_OWNER.by(user2).add(:greenplum_instance => instance2, :new_owner => user3)

      event1 = Events::GREENPLUM_INSTANCE_CREATED.first
      event2 = Events::GREENPLUM_INSTANCE_CHANGED_OWNER.first

      event1.actor.should == user1
      event1.greenplum_instance.should == instance1

      event2.actor.should == user2
      event2.greenplum_instance.should == instance2
      event2.new_owner.should == user3
    end
  end

  it "is ordered with the most recent items first, by default" do
    event1 = FactoryGirl.create(:workfile_created_event, :created_at => Time.now)
    event2 = FactoryGirl.create(:workfile_created_event, :created_at => Time.now + 25)
    event3 = FactoryGirl.create(:workfile_created_event, :created_at => Time.now + 50)
    event4 = FactoryGirl.create(:workfile_created_event, :created_at => Time.now + 75)

    Events::Base.all.should == [event4, event3, event2, event1]
  end

  describe ".for_dashboard_of(user)" do
    let(:user) { FactoryGirl.create(:user) }
    let(:events) { (1..4).map { FactoryGirl.create(:workfile_created_event) } }

    let(:other_workspace1) { FactoryGirl.create(:workspace, :public => true) }
    let(:other_workspace2) { FactoryGirl.create(:workspace, :public => false) }
    let(:user_workspace) do
      FactoryGirl.create(:workspace).tap do |workspace|
        workspace.memberships.build.tap do |m|
          m.user = user
          m.save!
        end
      end
    end

    let!(:workspace_activity) { Activity.create!(:entity => user_workspace, :event => events[0] ) }
    let!(:other_workspace1_activity) { Activity.create!(:entity => other_workspace1, :event => events[1]) }
    let!(:other_workspace2_activity) { Activity.create!(:entity => other_workspace2, :event => events[2]) }

    let!(:global_activity) { Activity.global.create!(:event => events[3]) }
    let!(:duplicate_global_activity) { Activity.global.create!(:event => events[0]) }

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
