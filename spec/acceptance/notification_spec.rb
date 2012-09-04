require 'spec_helper'

resource "Notifications" do
  let(:user) { users(:bob) }

  before do
    log_in user
  end

  get "/notifications" do
    example_request "Returns a list of notifications" do
      status.should == 200
    end
  end
end
