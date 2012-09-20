require "spec_helper"

describe NotificationsController do
  let(:notification1) { current_user.notifications.first }
  let(:notification2) { current_user.notifications[1] }
  let(:event1) { notification1.notification_event }
  let(:event2) { notification2.notification_event }
  let(:current_user) { users(:owner) }

  before do
    log_in current_user
  end

  describe "#index" do
    it "is successful" do
      get :index
      response.code.should == "200"
    end

    it "shows list of notifications" do
      get :index
      first_event = decoded_response.first
      first_event.actor.id.should == event1.actor_id
      first_event.action.include? event1.action
      first_event.greenplum_instance.id.should == event1.target1_id
      first_event.body.should == event1.body
      first_event.should have_key(:unread)
    end

    it "should paginate notifications" do
      get :index, :per_page => 1
      decoded_response.length.should == 1
    end

    context "when the unread parameter is passed" do
      it "only returns unread notifications" do
        put :read, :notification_ids => [event1.id]
        get :index, :type => 'unread'
        decoded_response.length.should == current_user.notification_events.length - 1
      end
    end

    generate_fixture "notificationSet.json" do
      put :read, :notification_ids => [event1.id]
      get :index
    end
  end

  describe '#read' do
    it "marks all notifications passed as read" do
      notification1.read.should be_false
      put :read, :notification_ids => [event1.id]
      notification1.reload.read.should be_true
      response.code.should == '200'
    end
  end
end