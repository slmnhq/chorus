require "spec_helper"

describe Notification do
  it { should validate_presence_of :recipient_id }
  it { should validate_presence_of :event_id }

  describe "#destroy" do
    let(:notification) { notifications(:notification1) }

    before do
      notification.destroy
    end

    it "should update the deleted_at field" do
      Notification.find_with_destroyed(notification.id).deleted_at.should_not be_nil
    end
    it "should be hidden from subsequent #find calls" do
      Notification.find_by_id(notification.id).should be_nil
    end
  end
end
