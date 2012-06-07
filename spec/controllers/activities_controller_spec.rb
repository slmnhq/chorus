require "spec_helper"

describe ActivitiesController do
  before do
    log_in FactoryGirl.create(:admin)
  end

  describe "#index" do
    let(:user) { FactoryGirl.create(:user) }
    let!(:activity1) { FactoryGirl.create(:activity, :action => "bar", :entity => object) }
    let!(:activity2) { FactoryGirl.create(:activity, :action => "foo", :entity => object) }

    context "when getting the activities for an instance" do
      let(:object) { FactoryGirl.build(:instance) }

      it "presents the instance's activities" do
        mock_present { |models| models.should include(activity1, activity2) }
        get :index, :instance_id => object.id
      end
    end
  end
end
