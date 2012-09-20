require 'spec_helper'

resource "Notifications" do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  get "/notifications" do
    example_request "Returns a list of notifications" do
      status.should == 200
    end
  end

  put "/notifications/read" do
    parameter :notification_ids, "IDs of events to be marked as read"

    let(:notification_ids) { user.notification_events[0..1].map(&:id) }

    required_parameters :notification_ids

    example_request "Marks notifications as read" do
      status.should == 200
    end
  end
end
