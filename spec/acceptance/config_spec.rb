require 'spec_helper'

resource "Config" do
  let(:user) { FactoryGirl.create :admin }

  get "/config" do
    before do
      log_in user
    end

    example_request "Get server configuration" do
      status.should == 200
    end
  end
end
