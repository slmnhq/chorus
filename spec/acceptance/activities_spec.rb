require 'spec_helper'

resource "Activities" do
  let(:user) { FactoryGirl.create :user }

  get "/activities" do
    before do
      log_in user
    end

    example_request "Get list of activities" do
      status.should == 200
    end
  end
end
