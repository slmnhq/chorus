require "spec_helper"

describe NotificationsController do
  describe "#index" do
    let(:bobs_event) { notifications(:bobs_notification1).notification_event }
    let(:current_user) { users(:bob) }

    before do
      log_in current_user
    end

    it "is successful" do
      get :index
      response.code.should == "200"
    end

    it "shows list of notifications" do
      get :index
      first_event = decoded_response.first
      first_event.actor.id.should == bobs_event.actor_id
      first_event.action.include? bobs_event.action
      first_event.greenplum_instance.id.should == bobs_event.target1_id
      first_event.body.should == bobs_event.body
    end

    generate_fixture "notificationSet.json" do
      get :index
    end
  end
end