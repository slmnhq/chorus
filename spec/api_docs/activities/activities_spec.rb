require 'spec_helper'

resource "Activities" do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  get "/activities" do
    parameter :entity_type, "The type of entity whose activities will be returned, or 'dashboard' for all visible activities"
    parameter :entity_id, "For entity_type other than 'dashboard', the id of the entity whose activities will be returned"
    pagination

    let(:entity_type) { "dashboard" }
    required_parameters :entity_type

    example_request "Get list of activities" do
      explanation <<-DOCS
        Gets the list of recent activities visible to the current user.
        An entity_type of 'dashboard' will return all events the user can see.
        Other entity_type values will limit the activities to only ones that have involved an entity of the specified type.
      DOCS
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
