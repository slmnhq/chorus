require "spec_helper"

describe Activity do
  let(:user) { FactoryGirl.create(:user) }

  let!(:instance1) { FactoryGirl.create(:instance) }
  let!(:instance2) { FactoryGirl.create(:instance) }

  let!(:activity1) { Activity.create!(:entity => instance1, :created_at => Time.now) }
  let!(:activity2) { Activity.create!(:entity => instance2, :created_at => Time.now + 25) }

  let!(:activity3) { Activity.create!(:entity_type => "GLOBAL", :created_at => Time.now + 50) }
  let!(:activity4) { Activity.create!(:entity_type => "GLOBAL", :created_at => Time.now + 100) }

  describe ".global" do
    it "returns the activities whose 'entity_type' has the special value 'GLOBAL'" do
      Activity.global.all.should =~ [ activity3, activity4 ]
    end
  end

  describe ".for_dashboard_of(user)" do
    let(:workspace1) { FactoryGirl.create(:workspace, :public => false) }
    let(:workspace2) { FactoryGirl.create(:workspace, :public => false) }
    let(:workspace3) { FactoryGirl.create(:workspace, :public => true) }

    let!(:workspace1_activity) { Activity.create!(:entity => workspace1) }
    let!(:workspace2_activity) { Activity.create!(:entity => workspace2) }
    let!(:workspace3_activity) { Activity.create!(:entity => workspace3) }

    before do
      workspace1.memberships.build.tap do |membership|
        membership.user = user
        membership.save!
      end
    end

    it "includes all global activities" do
      Activity.for_dashboard_of(user).should include activity3, activity4
    end

    it "includes all activities for the user's workspaces" do
      Activity.for_dashboard_of(user).should include(workspace1_activity)
    end

    it "does not include activities for other public workspaces" do
      Activity.for_dashboard_of(user).should_not include(workspace2_activity, workspace3_activity)
      Activity.for_dashboard_of(user).should have(3).activities
    end
  end

  it "is ordered with the most recent items first, by default" do
    Activity.all.should == [ activity4, activity3, activity2, activity1 ]
  end
end
