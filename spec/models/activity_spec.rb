require "spec_helper"

describe Activity do
  describe "scopes" do
    let!(:user1) { FactoryGirl.create(:user) }
    let!(:user2) { FactoryGirl.create(:user) }

    let!(:activity1) { Activity.create!(:entity => user1) }
    let!(:activity2) { Activity.create!(:entity => user2) }

    let!(:activity3) { Activity.create!(:entity_type => "GLOBAL") }
    let!(:activity4) { Activity.create!(:entity_type => "GLOBAL") }

    describe ".global" do
      it "returns the activities whose 'entity_type' has the special value 'GLOBAL'" do
        Activity.global.all.should =~ [ activity3, activity4 ]
      end
    end
  end
end
