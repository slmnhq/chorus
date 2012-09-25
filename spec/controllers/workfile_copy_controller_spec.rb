require "spec_helper"

describe WorkfileCopyController do
  let(:user) { users(:the_collaborator) }
  let(:workspace) { workspaces(:public) }
  let(:workfile) { workfiles(:public) }
  let(:workfile_version) { workfile.versions.first }
  let(:target_workspace) { workspaces(:public_with_no_collaborators) }

  describe "#create" do
    before do
      log_in user
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save!
    end

    it "should copy a workfile to a new active workspace" do
      lambda {
        post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      }.should change(target_workspace.workfiles, :count).by(1)
    end

    it "should copy latest version to a new active workspace" do
      workfile_version1 = FactoryGirl.create(:workfile_version, :workfile => workfile)
      workfile_version1.version_num =2
      workfile_version1.contents = test_file('some.txt')
      workfile_version1.save!
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      copied_workfile = Workfile.last
      File.read(workfile_version1.contents.path).should == File.read(copied_workfile.latest_workfile_version.contents.path)
    end

    it "should not copy if user is not a member of source workspace" do
      another_user = users(:no_collaborators)
      membership = FactoryGirl.create(:membership, :workspace => target_workspace, :user => another_user)
      log_in another_user
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      response.status.should == 403
    end

    it "should not copy if user is not a member of target workspace" do
      another_user = users(:owner)
      membership = FactoryGirl.create(:membership, :workspace => workspace, :user => another_user)
      log_in another_user
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      response.status.should == 403
    end
  end
end