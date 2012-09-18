require 'spec_helper'

describe MembersController do
  ignore_authorization!

  let(:member) { users(:no_collaborators) }
  let(:non_member) { users(:bob) }
  let(:admin) { users(:admin) }
  let(:public_workspace) { workspaces(:public_with_no_collaborators) }
  let(:private_workspace) { workspaces(:private_with_no_collaborators) }

  describe "#index" do
    context "user is not a member of the workspace" do
      before :each do
        log_in non_member
      end

      it "does not show all members for the workspace" do
        get :index, :workspace_id => private_workspace.id

        response.code.should == "200"
        decoded_response.should have(0).items
      end
    end

    context "user is a member of the workspace" do
      before :each do
        log_in member
      end

      it "shows the members of the workspace" do
        get :index, :workspace_id => private_workspace.id

        response.code.should == "200"
        decoded_response.should have(private_workspace.members.length).items #including the owner
      end
    end

    context "user is an admin" do
      before :each do
        log_in admin
      end

      it "shows the members of the workspaces" do
        get :index, :workspace_id => private_workspace.id

        response.code.should == "200"
        decoded_response.should have(private_workspace.members.length).items #including the owner
      end
    end

    context "workspace is public" do
      before :each do
        log_in non_member
      end

      it "shows the member of the public workspace" do
        get :index, :workspace_id => public_workspace.id

        response.code.should == "200"
        decoded_response.should have(public_workspace.members.length).items # including the owner
      end
    end
  end

  describe "#create" do
    let(:workspace) { workspaces(:public_with_no_collaborators) }
    let(:member1) { users(:bob) }
    let(:member2) { users(:no_collaborators) }
    let(:member3) { users(:carly) }
    let(:member4) { users(:admin) }
    let(:parameters) { {:workspace_id => workspace.id, :member_ids => [member1.id, member2.id, member3.id]} }

    before :each do
      log_in workspace.owner
    end

    it "uses authorization" do
      mock(subject).authorize!(:owner, workspace)
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
        }.should change(Membership, :count).by(1)
      end

      it "sets has_added_member to true" do
        post :create, parameters
        workspace.reload.has_added_member.should be_true
      end

      it "creates a MembersAdded event with the right num_added value" do
        parameters = {:workspace_id => workspace.id, :member_ids => [member1.id, member2.id, member3.id, member4.id]}

        expect {
          post :create, parameters
        }.to change(Events::MembersAdded, :count).by(1)

        Events::MembersAdded.limit(1).order('id desc').first.num_added.should == "2"
      end

      it "creates a notification for each member of the workspace" do
        parameters = {:workspace_id => workspace.id, :member_ids => [member1.id, member2.id, member3.id, member4.id]}

        expect {
          post :create, parameters
        }.to change(Notification, :count).by(2)

        Notification.last.recipient.id == member4.id
      end
    end

    context "change some of the members for the workspace" do
      let(:parameters) { {:workspace_id => workspace.id, :member_ids => [member2.id]} }

      it "should remove members for the workspace" do
        lambda {
          post :create, parameters
        }.should change(Membership, :count).by(-1)
      end

      it "does not create any events" do
        expect {
          post :create, parameters
        }.not_to change(Events::Base, :count)
      end

      it "does not create any notifications" do
        expect {
          post :create, parameters
        }.not_to change(Notification, :count)
      end
    end

    context "change some of the members for the workspace without passing owner's id in member array'" do
      let(:parameters) { {:workspace_id => workspace.id, :member_ids => [member1.id]} }

      it "doesn't update the members'" do
        lambda {
          post :create, parameters
        }.should_not change(Membership, :count)
      end

      it "does not create any events" do
        expect {
          post :create, parameters
        }.not_to change(Events::Base, :count)
      end

      it "does not create any notifications" do
        expect {
          post :create, parameters
        }.not_to change(Notification, :count)
      end

      it "throws an error" do
        post :create, parameters

        response.code.should == '422'

        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['owner'].should have_key('OWNER MUST BE A MEMBER')
      end
    end
  end
end

