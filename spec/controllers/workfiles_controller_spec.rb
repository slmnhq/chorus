require 'spec_helper'

describe WorkfilesController do
  let(:user) { FactoryGirl.create(:user) }
  let(:admin) { FactoryGirl.create(:admin) }
  let(:non_member) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
  let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/workfile.sql", Rails.root), "text/sql")] }

  describe "#create" do
    before(:each) do
      @params = {
          :workspace_id => workspace.to_param,
          :workfile => {
              :description => "Nice workfile, good workfile, I've always wanted a workfile like you",
              :contents => files
          }
      }
    end

    it_behaves_like "an action that requires authentication", :post, :create

    context "as a member of the workspace" do
      let(:current_user) { user }

      before(:each) do
        log_in user
      end

      it_behaves_like "uploading a new workfile"
    end

    context "as an admin" do
      let(:current_user) { admin }

      before(:each) do
        log_in admin
      end

      it_behaves_like "uploading a new workfile"
    end

    context "as a non-admin non-member" do
      before(:each) do
        log_in non_member
      end

      it "should not allow workfile creation" do
        lambda {
          lambda {
            post :create, @params
            response.should_not be_success
          }.should_not change(Workfile, :count)
        }.should_not change(WorkfileVersion, :count)
      end
    end
  end
end