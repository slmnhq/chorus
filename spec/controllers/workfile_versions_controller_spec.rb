require 'spec_helper'

describe WorkfileVersionsController do
  let(:user) { FactoryGirl.create(:user) }

  before do
    log_in user
  end

  context "#update" do
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql')}
    let(:workfile_version) { FactoryGirl.build(:workfile_version, :workfile => workfile) }

    before do
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save
    end

    it "changes the file content" do
      post :update, :workfile_id => workfile.id, :id => workfile_version.id, :workfile => {:content => 'New content'}

      File.read(workfile.last_version.contents.path).should == 'New content'
    end

    it "deletes any saved workfile drafts for this workfile and user" do
      draft = FactoryGirl.create(:workfile_draft, :workfile_id => workfile.id, :owner_id => user.id)
      WorkfileDraft.find_all_by_owner_id_and_workfile_id(user.id, workfile.id).length.should == 1

      post :update, :workfile_id => workfile.id, :id => workfile_version.id, :workfile => {:content => 'New content'}
      WorkfileDraft.find_all_by_owner_id_and_workfile_id(user.id, workfile.id).length.should == 0
    end
  end

  context "#create" do
    let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
    let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql')}
    let(:workfile_version) { FactoryGirl.build(:workfile_version, :workfile => workfile) }

    before do
      workfile_version.contents = test_file('workfile.sql')
      workfile_version.save
    end

    it "changes the file content" do
      post :create, :workfile_id => workfile.id, :workfile => {:content => 'New content', :commit_message => 'A new version'}

      File.read(workfile.last_version.contents.path).should == 'New content'
      decoded_response[:version_info][:content].should == 'New content'

      decoded_response[:version_info][:commit_message].should == 'A new version'
      decoded_response[:version_info][:version_num].should == 2
    end

    it "deletes any saved workfile drafts for this workfile and user" do
      draft = FactoryGirl.create(:workfile_draft, :workfile_id => workfile.id, :owner_id => user.id)
      WorkfileDraft.find_all_by_owner_id_and_workfile_id(user.id, workfile.id).length.should == 1

      post :create, :workfile_id => workfile.id, :workfile => {:content => 'New content', :commit_message => 'A new version'}
      WorkfileDraft.find_all_by_owner_id_and_workfile_id(user.id, workfile.id).length.should == 0
    end
  end
end
