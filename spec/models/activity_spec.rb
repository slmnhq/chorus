require "spec_helper"

describe Activity do
  describe ".global" do
    it "returns the activities whose 'entity_type' has the special value 'GLOBAL'" do
      activity = Activity.global.create!(:created_at => Time.now + 25)
      activity.entity_type.should == "GLOBAL"
      activity.entity_id.should be_nil
    end
  end
end
