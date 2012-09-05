require "spec_helper"

describe NotificationsController do
  let(:bobs_notification) { notifications(:bobs_notification1) }
  let(:bobs_event) { bobs_notification.notification_event }
  let(:current_user) { users(:bob) }

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
      first_event.actor.id.should == bobs_event.actor_id
      first_event.action.include? bobs_event.action
      first_event.greenplum_instance.id.should == bobs_event.target1_id
      first_event.body.should == bobs_event.body
    end

    it "should paginate notifications" do
      get :index, :per_page => 1
      decoded_response.length.should == 1
    end

    generate_fixture "notificationSet.json" do
      get :index
    end
  end

  describe '#read' do
    it "marks all notifications passed as read" do
      bobs_notification.read.should be_false
      put :read, :notification_ids => [bobs_notification.id]
      bobs_notification.reload.read.should be_true
      response.code.should == '200'
    end
  end
end