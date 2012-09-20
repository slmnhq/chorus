require "spec_helper"

describe NotificationPresenter, :type => :view do

  let(:notification) { notifications(:notification1) }
  let(:presenter) { NotificationPresenter.new(notification, view) }

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "includes the right keys" do
      hash.should have_key(:id)
      hash.should have_key(:event)
      hash.should have_key(:recipient)
      hash.should have_key(:comment)
      hash.should have_key(:unread)
      hash.should have_key(:timestamp)
    end
  end
end