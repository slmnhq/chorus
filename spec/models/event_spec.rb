require "spec_helper"

describe Event do
  let!(:user) { FactoryGirl.create :user }

  describe "when an event is created" do
    let!(:event) do
      Event.create(
        :action => action,
        :actor => user,
        :target1 => target1
      )
    end

    context "INSTANCE_CREATED" do
      let(:action) { "INSTANCE_CREATED" }
      let(:target1) { FactoryGirl.create(:instance) }

      it "creates activities for the instance and for the actor, and one global activity (with no entity)" do
        activities = Activity.where(:event_id => event.id)

        activities.map(&:entity).should =~ [
          user,
          target1,
          nil
        ]

        Activity.global.find_by_event_id(event.id).should_not be_nil
      end
    end
  end

  describe ".add(actor, action, target)" do
    it "creates an event with the given actor, action and target" do
      model = FactoryGirl.create(:instance)
      Event.add(user, "DID_SOMETHING", model)

      event = Event.find_by_action("DID_SOMETHING")
      event.target1.should == model
      event.actor.should == user
    end
  end
end
