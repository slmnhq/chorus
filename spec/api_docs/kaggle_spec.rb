require 'spec_helper'

resource "Kaggle" do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  get "/kaggle/users" do
    example_request "Get a list of Kaggle users" do
      status.should == 200
    end
  end
end
