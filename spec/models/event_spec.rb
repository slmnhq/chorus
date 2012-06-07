require "spec_helper"

describe Event do
  describe "when an event is created" do
    let!(:user) { FactoryGirl.create :user }
    let!(:event) do
      Event.create(
        :action => action,
        :actor => user,
        :object => object
      )
    end

    context "INSTANCE_CREATED" do
      let(:action) { "INSTANCE_CREATED" }
      let(:object) { FactoryGirl.create(:instance) }

      it "creates activities for the instance and for the actor" do
        activities = Activity.where(:event_id => event.id)
        activities.map(&:entity).should =~ [user, object]
      end

      it "creates a global activity" do
        Activity.global.find_by_event_id(event.id).should_not be_nil
      end
    end
  end
end