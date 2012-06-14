require "spec_helper"

describe ActivitiesController do
  let(:user) { FactoryGirl.create(:user) }
  let(:object) { FactoryGirl.build(:user) }

  let!(:activity1) { Activity.create!(:entity => object) }
  let!(:activity2) { Activity.create!(:entity => object) }
  let!(:global_activity1) { Activity.global.create! }
  let!(:global_activity2) { Activity.global.create! }

  before do
    log_in FactoryGirl.create(:admin)
  end

  describe "#index" do
    context "when getting the activities for an instance" do
      let(:object) { FactoryGirl.create(:instance) }

      it "presents the instance's activities" do
        mock_present { |models| models.should =~ [activity1, activity2] }
        get :index, :instance_id => object.id
      end
    end

    context "when getting the activities for a hadoop instance" do
      let(:object) { FactoryGirl.create(:hadoop_instance) }

      it "presents the hadoop instance's activities" do
        mock_present { |models| models.should =~ [activity1, activity2] }
        get :index, :hadoop_instance_id => object.id
      end
    end

    context "when getting the activities for a user" do
      let(:object) { FactoryGirl.create(:user) }

      it "presents the user's activities" do
        mock_present { |models| models.should =~ [activity1, activity2] }
        get :index, :user_id => object.id
      end
    end

    context "when getting the activities for the current user's home page" do
      it "presents the user's activities" do
        mock_present { |models| models.should =~ [global_activity1, global_activity2] }
        get :index
      end
    end

    it "generates a JSON fixture " do
      mock_present { |models| models.should =~ [global_activity1, global_activity2] }
      get :index
    end
  end

  describe "#show" do
    it "show the particular activity " do
      mock_present { |model| model.should == global_activity1 }
      get :show, :id => global_activity1.to_param
    end

    generate_fixture "activity/instanceCreated.json" do
      event = FactoryGirl.create(:instance_created_event)
      activity = Activity.global.find_by_event_id(event.id)
      get :show, :id => activity.to_param
    end

    generate_fixture "activity/instanceChangedOwner.json" do
      event = FactoryGirl.create(:instance_changed_owner_event)
      activity = Activity.global.find_by_event_id(event.id)
      get :show, :id => activity.to_param
    end
  end
end
