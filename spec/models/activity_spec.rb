require "spec_helper"

describe Activity do
  let!(:user1) { FactoryGirl.create(:user) }
  let!(:user2) { FactoryGirl.create(:user) }

  let!(:activity1) { Activity.create!(:entity => user1, :created_at => Time.now) }
  let!(:activity2) { Activity.create!(:entity => user2, :created_at => Time.now + 25) }

  let!(:activity3) { Activity.create!(:entity_type => "GLOBAL", :created_at => Time.now + 50) }
  let!(:activity4) { Activity.create!(:entity_type => "GLOBAL", :created_at => Time.now + 100) }

  describe ".global" do
    it "returns the activities whose 'entity_type' has the special value 'GLOBAL'" do
      Activity.global.all.should =~ [ activity3, activity4 ]
    end
  end

  it "is ordered with the most recent items first, by default" do
    Activity.all.should == [ activity4, activity3, activity2, activity1 ]
  end
end
