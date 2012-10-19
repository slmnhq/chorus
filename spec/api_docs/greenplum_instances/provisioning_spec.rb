require 'spec_helper'

resource "Greenplum DB: instances" do
  let(:user) { users(:admin) }

  before do
    log_in user
  end

  get "/provisioning" do
    example_request "Get options for provisioning a Greenplum instance" do
      status.should == 200
    end
  end
end
