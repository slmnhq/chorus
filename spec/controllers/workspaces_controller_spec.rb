require 'spec_helper'

describe WorkspacesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
    @workspace1 = FactoryGirl.create(:workspace, :name => "workspace1")
    @workspace2 = FactoryGirl.create(:workspace, :name => "workspace2")
  end

  describe "#index" do
    it_behaves_like "an action that requires authentication", :get, :index

    it "returns all workspaces (access control not implemented)" do
      get :index
      response.code.should == "200"
      decoded_response[0].name.should == "workspace1"
      decoded_response[1].name.should == "workspace2"
    end
  end
end
