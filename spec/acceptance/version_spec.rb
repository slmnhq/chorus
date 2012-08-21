require 'spec_helper'

resource "Version" do
  let!(:user) { users(:admin) }

  before do
    log_in user
  end

  get "/VERSION" do
    example_request "Returns the version of Chorus" do
      status.should == 200
    end
  end
end
