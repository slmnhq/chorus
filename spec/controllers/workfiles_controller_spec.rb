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

  describe "#index" do
    before(:each) do
      log_in user

      @wf4 = FactoryGirl.create(:workfile, :file_name => "workfile4.sql", :workspace => workspace)
      FactoryGirl.create(:workfile_version, :workfile => @wf4, :contents => file)

      @wf3 = FactoryGirl.create(:workfile, :file_name => "workfile3.sql", :workspace => workspace)
      FactoryGirl.create(:workfile_version, :workfile => @wf3, :contents => file)

      @wf2 = FactoryGirl.create(:workfile, :file_name => "workfile2.sql", :workspace => workspace)
      FactoryGirl.create(:workfile_version, :workfile => @wf2, :contents => file)

      @wf1 = FactoryGirl.create(:workfile, :file_name => "workfile1.sql", :workspace => workspace)
      FactoryGirl.create(:workfile_version, :workfile => @wf1, :contents => file)
    end

    it "responds with a success" do
      get :index, :workspace_id => workspace.id
      response.code.should == "200"
    end

    it "sorts by file name by default" do
      get :index, :workspace_id => workspace.id
      decoded_response.first.id.should == @wf1.id
    end

    it "sorts by last updated " do
      get :index, :workspace_id => workspace.id, :order => "date"
      decoded_response.first.id.should == @wf4.id
    end

    it "sorts by Workfile name " do
      get :index, :workspace_id => workspace.id, :order => "file_name"
      decoded_response.first.id.should == @wf1.id
    end

    context "with file types" do
      before do
        code_file = test_file("code.cpp", "text/plain")
        wf = FactoryGirl.create(:workfile, :file_name => "code.cpp", :workspace => workspace)
        FactoryGirl.create(:workfile_version, :workfile => wf, :contents => code_file)
      end

      it "filters by file type: sql" do
        get :index, :workspace_id => workspace.id, :order => "file_name", :file_type => "sql"
        response.code.should == "200"
        decoded_response.length.should == 4
      end

      it "filters by file type: code" do
        get :index, :workspace_id => workspace.id, :order => "file_name", :file_type => "code"
        response.code.should == "200"
        decoded_response.length.should == 1
      end
    end

    describe "pagination" do
      it "defaults the per_page to fifty" do
        get :index, :workspace_id => workspace.id
        decoded_response.length.should == 4
        request.params[:per_page].should == 50
      end

      it "paginates the collection" do
        get :index, :workspace_id => workspace.id, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :workspace_id => workspace.id, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.id.should == @wf1.id
        decoded_response.second.id.should == @wf2.id
      end

      it "accepts a page parameter" do
        get :index, :workspace_id => workspace.id, :page => 2, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.id.should == @wf3.id
        decoded_response.last.id.should == @wf4.id
      end
    end

    generate_fixture "workfileSet.json" do
      get :index, :workspace_id => workspace.id
    end
  end

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
          mock_present do |model, _, options|
            model.should == private_workfile.latest_workfile_version
            options[:contents].should be_present
          end

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

      def self.generate_workfile_fixture(json_filename, uploaded_filename, mime_type)
        generate_fixture "workfile/#{json_filename}" do
          file = test_file(uploaded_filename, mime_type)
          workfile = FactoryGirl.create(:workfile, :workspace => workspace, :file_name => uploaded_filename)
          FactoryGirl.create(:workfile_version, :workfile => workfile, :contents => file)
          get :show, :id => workfile
        end
      end

      generate_workfile_fixture("sql.json", "workfile.sql", "text/plain")
      generate_workfile_fixture("text.json", "some.txt", "text/plain")
      generate_workfile_fixture("image.json", "small1.gif", "image/gif")
      generate_workfile_fixture("binary.json", "binary.tar.gz", "application/octet-stream")
    end
  end

  describe "#create" do
    before(:each) do
      @params = {
        :workspace_id => workspace.to_param,
        :workfile => {
          :description => "Nice workfile, good workfile, I've always wanted a workfile like you",
          :versions_attributes => [{:contents => file}]
        }
      }
    end

    it_behaves_like "an action that requires authentication", :post, :create

    context "as a member of the workspace" do
      let(:current_user) { user }

      before(:each) do
        log_in user
      end

      it "creates a workfile" do
        post :create, @params
        Workfile.last.file_name.should == "workfile.sql"
      end

      it "sets has_added_workfile on the workspace to true" do
        post :create, @params
        workspace.reload.has_added_workfile.should be_true
      end

      it "makes a WorkfileCreated event" do
        post :create, @params
        event = Events::WorkfileCreated.by(user).first
        event.workfile.description.should == @params[:workfile][:description]
        event.workspace.to_param.should == @params[:workspace_id]
      end

      it "creates a workfile from an svg document" do
        post :create, :workspace_id => workspace.to_param, :workfile => { :file_name => 'some_vis.png', :svg_data => '<svg xmlns="http://www.w3.org/2000/svg"></svg>' }
        Workfile.last.file_name.should == 'some_vis.png'
      end
    end
  end

  describe "#destroy" do
    before do
      workspace.members << member
      log_in member
    end

    it "uses authorization" do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      delete :destroy, :id => public_workfile.id
    end

    describe "deleting" do
      before do
        delete :destroy, :id => public_workfile.id
      end

      it "should soft delete the workfile" do
        workfile = Workfile.find_with_destroyed(public_workfile.id)
        workfile.deleted_at.should_not be_nil
      end

      it "should respond with success" do
        response.should be_success
      end
    end
  end
end
