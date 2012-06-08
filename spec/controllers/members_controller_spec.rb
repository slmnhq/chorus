require 'spec_helper'

describe MembersController do
  ignore_authorization!

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
        decoded_response.should have(3).items #including the owner
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
        decoded_response.should have(2).items #including the owner
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
        decoded_response.should have(2).items # including the owner
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

  describe "#create" do
    let(:workspace) { workspace = FactoryGirl.create(:workspace) }
    let(:member1) { FactoryGirl.create(:user) }
    let(:member2) { FactoryGirl.create(:user) }
    let(:member3) { FactoryGirl.create(:user) }
    let(:parameters) { {:workspace_id => workspace.id, :member_ids => [member1.id, member2.id, workspace.owner.id]} }

    before :each do
      log_in workspace.owner
    end

    it "uses authorization" do
      mock(subject).authorize!(:administrative_edit, workspace)
      post :create, parameters
    end

    it "should respond with a 200" do
      post :create, parameters
      response.code.should == "200"
    end

    context "add the members for the workspace" do
      it "should add members for the workspace" do
        lambda {
          post :create, parameters
        }.should change(Membership, :count).by(2)
      end

      it "should set has_added_member to true" do
        post :create, parameters
        workspace.reload.has_added_member.should be_true
      end
    end

    context "change some of the members for the workspace" do
      let(:parameters) { {:workspace_id => workspace.id, :member_ids => [member1.id, workspace.owner.id]} }

      it "should remove members for the workspace" do
        workspace.members << member1
        workspace.members << member2

        lambda {
          post :create, parameters
        }.should change(Membership, :count).by(-1)
      end
    end
  end
end

