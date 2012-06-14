require "spec_helper"

describe Event do
  let!(:user) { FactoryGirl.create :user }

  describe "when an event is created" do
    context "INSTANCE_CREATED" do
      let(:instance) { FactoryGirl.create(:instance) }
      let!(:event)  { Event::INSTANCE_CREATED.create!(:actor => user, :target1 => instance) }

      it "creates activities for the instance and for the actor, and one global activity (with no entity)" do
        activities = Activity.where(:event_id => event.id)
        activities.map(&:entity).should =~ [ user, instance, nil ]
        Activity.global.find_by_event_id(event.id).should_not be_nil
      end
    end
  end

  describe ".add(actor, target)" do
    it "creates an event with the given actor and target" do
      model = FactoryGirl.create(:instance)
      Event::INSTANCE_CREATED.add(user, model)

      event = Event::INSTANCE_CREATED.first
      event.target1.should == model
      event.actor.should == user
    end
  end
end
