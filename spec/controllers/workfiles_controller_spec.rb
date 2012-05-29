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
  let(:file) { test_file("workfile.sql", "text/sql") }

  describe "#show" do
    context "for a private workspace" do
      before do
        FactoryGirl.create(:workfile_version, :workfile => private_workfile, :contents => file)
      end

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
      before do
        FactoryGirl.create(:workfile_version, :workfile => public_workfile, :contents => file)

        log_in non_member
      end

      it "responds with a success" do
        get :show, {:id => public_workfile}
        response.should be_success
      end
    end

    describe "jasmine fixtures" do
      before do
        log_in admin
      end

      def self.generate_fixture(json_filename, uploaded_filename, mime_type)
        self.it "generates a JSON fixture", :fixture => true do
          file = test_file(uploaded_filename, mime_type)
          FactoryGirl.create(:workfile_version, :workfile => public_workfile, :contents => file)
          get :show, :id => public_workfile
          save_fixture("workfile/#{json_filename}")
        end
      end

      generate_fixture("sql.json", "workfile.sql", "text/plain")
      generate_fixture("text.json", "some.txt", "text/plain")
      generate_fixture("image.json", "small1.gif", "image/gif")
      generate_fixture("binary.json", "binary.tar.gz", "application/octet-stream")
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

    context "archived workspaces" do
      let(:archived_workspace) { FactoryGirl.create(:workspace, :owner => user, :archived_at => Time.current) }

      before do
        log_in user
      end

      it "does not find the workspace to create the workfile" do
        post :create, { :workspace_id => archived_workspace.id, :workfile => {} }
        response.code.should == "404"
      end
    end

    context "creating a blank file" do
      let(:current_user) { user }

      before(:each) do
        log_in current_user

        @params = {
            :workspace_id => workspace.to_param,
            :workfile => {
                :file_name => "empty_file.sql",
                :source => 'empty'
            }
        }
      end

      before do
        post :create, @params
      end

      subject { Workfile.last }

      it "associates the new workfile with its workspace" do
        subject.workspace.should == workspace
        decoded_response.workspace.should be_present
      end

      it "sets the owner of the new workfile as the authenticated user" do
        subject.owner.should == current_user
      end

      it "sets the right description on the workfile" do
        subject.description.should be_blank
      end

      describe "workfile version" do
        subject { WorkfileVersion.last }

        it "associates the new version with its workfile" do
          subject.workfile.should == Workfile.last
        end

        it "sets the version number of the workfile version to 1" do
          subject.version_num.should == 1
        end

        it "sets the workfile version owner to the current user" do
          subject.owner.should == current_user
        end

        it "sets the commit message to be empty" do
          subject.commit_message.should == ""
        end

        it "sets the last modifier to the current user" do
          subject.modifier.should == current_user
        end

        it "uploads the correct file contents" do
          subject.contents.should be_present
          subject.contents.original_filename.should == "empty_file.sql"
          subject.contents.size.should == 0
        end
      end
    end
  end
end
