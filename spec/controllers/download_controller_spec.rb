require 'spec_helper'

describe DownloadController do

  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
  let(:workfile) { FactoryGirl.create(:workfile, :workspace => workspace, :file_name => 'workfile.sql') }
  let(:workfile_version) { FactoryGirl.build(:workfile_version, :workfile => workfile) }

  before do
    log_in user
  end

  context "#show" do
    before do
      workfile_version.contents = test_file('some.txt')
      workfile_version.save
    end

    context "without version_id specified " do
      it "returns the latest version content" do
        get :show, :workfile_id => workfile.id

        response.headers['Content-Disposition'].should include("attachment")
        response.headers['Content-Disposition'].should include('filename="some.txt"')
        response.headers['Content-Type'].should == 'text/plain'
      end
    end

    context "with version_id specified " do

      it "returns the content of version specified in params" do
        workfile_version2 = workfile.create_new_version(user, test_file('workfile.sql'), "commit message - 2")
        get :show, :workfile_id => workfile.id, :version_id => workfile_version.id

        response.body.should include ("<!DOCTYPE")
        response.body.should_not include ("lame")
        response.headers['Content-Disposition'].should include("attachment")
        response.headers['Content-Disposition'].should include('filename="some.txt"')
        response.headers['Content-Type'].should == 'text/plain'
      end
    end

    context "in the case of draft" do
      before do
        draft = FactoryGirl.create(:workfile_draft, :content => "Valid content goes here", :workfile_id => workfile.id, :owner_id => user.id)
      end
      it "returns the content of draft for the particular user" do
        get :show, :workfile_id => workfile.id

        response.body.should include ("Valid content goes here")
        response.headers['Content-Disposition'].should include("attachment")
        response.headers['Content-Disposition'].should include('filename="some.txt"')
        response.headers['Content-Type'].should == 'text/plain'
      end

    end

  end
end