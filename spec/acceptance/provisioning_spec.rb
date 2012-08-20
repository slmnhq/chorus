require 'spec_helper'

resource "Provisioning" do
  let!(:user) { users(:admin) }

  before do
    log_in user
  end

  get "/provisioning" do
    example_request "Returns provisioning options json" do
      status.should == 200
    end
  end
end
