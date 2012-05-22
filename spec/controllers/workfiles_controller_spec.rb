require 'spec_helper'

describe WorkfilesController do
  let(:user) { FactoryGirl.create(:user) }
  let(:admin) { FactoryGirl.create(:admin) }
  let(:member) { FactoryGirl.create(:user) }
  let(:non_member) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
  let(:private_workspace) { FactoryGirl.create(:workspace, :public => false) }
  let(:private_workfile) { FactoryGirl.create(:workfile, :workspace => private_workspace) }
  let(:public_workfile) { FactoryGirl.create(:workfile, :workspace => workspace) }
  let(:file) { Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/workfile.sql", Rails.root), "text/sql") }

  describe "#show" do
    context "for a private workspace" do
      context "as a workspace member" do
        before(:each) do
          private_workspace.members << member
          log_in member
        end

        it "responds with a success" do
          get :show, {:id => private_workfile}
          response.should be_success
        end

        it "presents the workfile" do
          mock.proxy(controller).present(private_workfile)
          get :show, {:id => private_workfile}
        end
      end

      context "as a non-member" do
        it "responds with unsuccessful" do
          log_in non_member
          get :show, {:id => private_workfile}
          response.should_not be_success
        end
      end
    end

    context "for a public workspace" do
      before { log_in non_member }

      it "responds with a success" do
        get :show, {:id => public_workfile}
        response.should be_success
      end
    end
  end

  describe "#create" do
    before(:each) do
      @params = {
          :workspace_id => workspace.to_param,
          :workfile => {
              :description => "Nice workfile, good workfile, I've always wanted a workfile like you",
              :contents => file
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