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
end
