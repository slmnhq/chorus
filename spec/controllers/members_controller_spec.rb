require 'spec_helper'

describe MembersController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
  end

  it "should show all members for the workspace" do
    workspace = FactoryGirl.create(:workspace)
    new_member = FactoryGirl.create(:user)
    workspace.members << new_member
    get :show, :id => workspace.id
    response.code.should == "200"
    decoded_response.size.should == 1
    decoded_response.first.id.should == new_member.id
  end

  it "should be empty for no members" do
    workspace = FactoryGirl.create(:workspace)
    get :show, :id => workspace.id
    response.code.should == "200"
    decoded_response.size.should == 0
  end
end