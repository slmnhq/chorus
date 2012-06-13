require "spec_helper"

describe Event do
  let!(:user) { FactoryGirl.create :user }

  describe "when an event is created" do
    let!(:event) do
      Event.create(
        :action => action,
        :actor => user,
        :target => target
      )
    end

    context "INSTANCE_CREATED" do
      let(:action) { "INSTANCE_CREATED" }
      let(:target) { FactoryGirl.create(:instance) }

      it "creates activities for the instance and for the actor, and one global activity (with no entity)" do
        activities = Activity.where(:event_id => event.id)

        activities.map(&:entity).should =~ [
          user,
          target,
          nil
        ]

        Activity.global.find_by_event_id(event.id).should_not be_nil
      end
    end
  end

  describe ".for_target(target)" do
    let(:target1) { FactoryGirl.create(:instance, :id => 1234)}
    let(:target2) { FactoryGirl.create(:instance) }
    let(:target3) { FactoryGirl.create(:user, :id => 1234) }

    let!(:target1_event1) { Event.create(:action => "Foo1", :actor => user, :target => target1 ) }
    let!(:target1_event2) { Event.create(:action => "Foo2", :actor => user, :target => target1 ) }
    let!(:target2_event) { Event.create(:action => "Foo3", :actor => user, :target => target2 ) }
    let!(:target3_event) { Event.create(:action => "Foo4", :actor => user, :target => target3 ) }

    it "returns the activities for the target" do
      Event.for_target(target1).should =~ [target1_event1, target1_event2]
    end
  end

  describe ".add(actor, action, target)" do
    it "creates an event with the given actor, action and target" do
      target = FactoryGirl.create(:instance)
      Event.add(user, "DID_SOMETHING", target)

      event = Event.for_target(target).find_by_action("DID_SOMETHING")
      event.actor.should == user
    end
  end
end
