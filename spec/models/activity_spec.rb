require "spec_helper"

describe Activity do
  it "is ordered with the most recent items first, by default" do
    activity1 = Activity.global.create!(:created_at => Time.now)
    activity2 = Activity.global.create!(:created_at => Time.now + 25)
    activity3 = Activity.global.create!(:created_at => Time.now + 50)
    activity4 = Activity.global.create!(:created_at => Time.now + 75)

    Activity.all.should == [activity4, activity3, activity2, activity1]
  end

  describe ".global" do
    it "returns the activities whose 'entity_type' has the special value 'GLOBAL'" do
      activity = Activity.global.create!(:created_at => Time.now + 25)
      activity.entity_type.should == "GLOBAL"
      activity.entity_id.should be_nil
    end
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

    let(:returned_events) { Activity.for_dashboard_of(user).map(&:event) }

    it "includes global activities" do
      returned_events.should include(global_activity.event)
    end

    it "includes activities for the user's workspaces" do
      returned_events.should include(workspace_activity.event)
    end

    it "does not include activities for other public workspaces" do
      returned_events.should_not include(other_workspace1_activity.event)
      returned_events.should_not include(other_workspace2_activity.event)
    end

    it "can be filtered further (like any activerecord relation)" do
      Activity.for_dashboard_of(user).find(global_activity.to_param).should == global_activity
    end
  end
end
