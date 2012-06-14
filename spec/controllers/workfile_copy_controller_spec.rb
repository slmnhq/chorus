require "spec_helper"

describe WorkfileCopyController do
  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
  let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace) }
  let(:workfile_version) { FactoryGirl.create(:workfile_version, :workfile => workfile) }
  let(:target_workspace) { FactoryGirl.create(:workspace, :owner => user) }


  describe "#create" do

    before do
      log_in user
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save!
    end

    it "should copy a workfile to a new active workspace" do
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      Workfile.count.should == 2
    end

    it "should copy latest version to a new active workspace" do
      workfile_version1 = FactoryGirl.create(:workfile_version, :workfile => workfile)
      workfile_version1.version_num =2
      workfile_version1.contents = test_file('some.txt')
      workfile_version1.save!
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      copied_workfile = Workfile.last
      File.read(workfile_version1.contents.path).should == File.read(copied_workfile.last_version.contents.path)
    end

    it "should not copy if user is not a member of source workspace" do
      another_user = FactoryGirl.create(:user)
      membership = FactoryGirl.create(:membership, :workspace => target_workspace, :user => another_user)
      log_in another_user
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      response.status.should == 403
    end
    it "should not copy if user is not a member of target workspace" do
      another_user = FactoryGirl.create(:user)
      membership = FactoryGirl.create(:membership, :workspace => workspace, :user => another_user)
      log_in another_user
      post :create, :workfile_id => workfile.id, :workspace_id => target_workspace.id
      response.status.should == 403
    end
  end
end