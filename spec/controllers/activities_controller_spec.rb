require "spec_helper"

describe ActivitiesController do
  let(:user) { FactoryGirl.create(:user) }
  let(:object) { FactoryGirl.build(:user) }

  let!(:activity1) { FactoryGirl.create(:activity, :action => "bar", :entity => object) }
  let!(:activity2) { FactoryGirl.create(:activity, :action => "foo", :entity => object) }
  let!(:global_activity1) { FactoryGirl.create(:global_activity, :action => "baz") }
  let!(:global_activity2) { FactoryGirl.create(:global_activity, :action => "quux") }

  before do
    log_in FactoryGirl.create(:admin)
  end

  describe "#index" do

    context "when getting the activities for an instance" do
      let(:object) { FactoryGirl.build(:instance) }

      it "presents the instance's activities" do
        mock_present { |models| models.should include(activity1, activity2) }
        get :index, :instance_id => object.id
      end
    end

    context "when getting the activities for a hadoop instance" do
      let(:object) { FactoryGirl.build(:hadoop_instance) }

      it "presents the hadoop instance's activities" do
        mock_present { |models| models.should include(activity1, activity2) }
        get :index, :hadoop_instance_id => object.id
      end
    end

    context "when getting the activities for a user" do
      let(:object) { FactoryGirl.build(:user) }

      it "presents the user's activities" do
        mock_present { |models| models.should include(activity1, activity2) }
        get :index, :user_id => object.id
      end
    end

    context "when getting the activities for the current user's home page" do
      it "presents the user's activities" do
        mock_present { |models| models.should include(global_activity1, global_activity2) }
        get :index
      end
    end

    it "generates a JSON fixture " do
      mock_present { |models| models.should include(global_activity1, global_activity2) }
      get :index
    end
  end

  describe "#show" do
    it "show the particular activity " do
      mock_present { |model| model.should == global_activity1 }
      get :show, :id => global_activity1.to_param
    end

    generate_fixture "activity/instanceCreated.json" do
      activity = FactoryGirl.create(:instance_created_activity)
      get :show, :id => activity.to_param
    end
  end
end
