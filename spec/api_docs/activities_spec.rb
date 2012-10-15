require 'spec_helper'

resource "Activities" do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  get "/activities?entity_type=dashboard" do
    example_request "Get list of activities" do
      status.should == 200
    end
  end

  get "/activities/:id" do
    let(:id) { Events::UserAdded.last.id }

    parameter :id, "Id of the activity/event"
    required_parameters :id

    example_request "Get an activity" do
      status.should == 200
    end
  end
end
