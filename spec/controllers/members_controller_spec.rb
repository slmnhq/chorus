require 'spec_helper'

describe MembersController do
  let(:user) { FactoryGirl.create(:user) }
  let(:admin) { FactoryGirl.create(:admin) }
  let(:workspace) { FactoryGirl.create(:workspace, {:public => false}) }

  describe "#index" do
    context "user is not a member of the workspace" do
      before :each do
        log_in user

        workspace.members << FactoryGirl.create(:user)
      end

      it "does not show all members for the workspace" do
        get :index, :workspace_id => workspace.id

        response.code.should == "200"
        decoded_response.should have(0).items
      end
    end

    context "user is a member of the workspace" do
      before :each do
        log_in user

        workspace.members << FactoryGirl.create(:user)
        workspace.members << user
      end

      it "shows the members of the workspace" do
        get :index, :workspace_id => workspace.id

        response.code.should == "200"
        decoded_response.should have(2).items
      end
    end

    context "user is an admin" do
      before :each do
        log_in admin

        workspace.members << FactoryGirl.create(:user)
      end

      it "shows the members of the workspaces" do
        get :index, :workspace_id => workspace.id

        response.code.should == "200"
        decoded_response.should have(1).item
      end
    end

    context "workspace is public" do
      before :each do
        log_in user
        workspace.update_attributes({:public => true})
        workspace.members << FactoryGirl.create(:user)
      end

      it "shows the member of the public workspace" do
        get :index, :workspace_id => workspace.id

        response.code.should == "200"
        decoded_response.should have(1).item
      end
    end

    context "workspace has no members" do
      before :each do
        log_in user
      end

      it "should be empty for no members" do
        get :index, :workspace_id => workspace.id

        response.code.should == "200"
        decoded_response.should have(0).items
      end
    end
  end
end
