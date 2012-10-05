require 'spec_helper'

describe WorkfilesController do
  let(:user) { users(:owner) }
  let(:admin) { users(:admin) }
  let(:member) { users(:the_collaborator) }
  let(:non_member) { users(:no_collaborators) }
  let(:workspace) { workspaces(:public) }
  let(:private_workspace) { workspaces(:private) }
  let(:private_workfile) { workfiles(:private) }
  let(:public_workfile) { workfiles(:public) }
  let(:file) { test_file("workfile.sql", "text/sql") }

  before do
    log_in user
  end

  describe "#index" do
    it "responds with a success" do
      get :index, :workspace_id => workspace.id
      response.code.should == "200"
    end

    it "sorts by file name by default" do
      get :index, :workspace_id => workspace.id
      names = decoded_response.map { |file| file.name }
      names.should == names.sort
    end

    it "sorts by last updated " do
      get :index, :workspace_id => workspace.id, :order => "date"
      timestamps = decoded_response.map { |file| file.updated_at }
      timestamps.should == timestamps.sort
    end

    it "sorts by Workfile name " do
      get :index, :workspace_id => workspace.id, :order => "file_name"
      names = decoded_response.map { |file| file.name }
      names.should == names.sort
    end

    context "with file types" do
      it "filters by file type: sql" do
        get :index, :workspace_id => workspace.id, :order => "file_name", :file_type => "sql"
        response.code.should == "200"
        decoded_response.length.should == 2
      end

      it "filters by file type: code" do
        get :index, :workspace_id => workspace.id, :order => "file_name", :file_type => "code"
        response.code.should == "200"
        decoded_response.length.should == 1
      end
    end

    describe "pagination" do
      let(:sorted_workfiles) { workspace.workfiles.sort_by!{|wf| wf.file_name.downcase } }

      it "defaults the per_page to fifty" do
        get :index, :workspace_id => workspace.id
        decoded_response.length.should == sorted_workfiles.length
        request.params[:per_page].should == 50
      end

      it "paginates the collection" do
        get :index, :workspace_id => workspace.id, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :workspace_id => workspace.id, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.id.should == sorted_workfiles.first.id
      end

      it "accepts a page parameter" do
        get :index, :workspace_id => workspace.id, :page => 2, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.id.should == sorted_workfiles[2].id
        decoded_response.last.id.should == sorted_workfiles[3].id
      end
    end

    generate_fixture "workfileSet.json" do
      get :index, :workspace_id => workspace.id
    end
  end

  describe "#show" do
    context "for a private workspace" do
      context "as a workspace member" do
        before do
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

      def self.generate_workfile_fixture(fixture_name, json_filename)
        generate_fixture "workfile/#{json_filename}" do
          fixture = workfiles(fixture_name)
          get :show, :id => fixture.id
        end
      end

      generate_workfile_fixture(:"sql.sql", "sql.json")
      generate_workfile_fixture(:"text.txt", "text.json")
      generate_workfile_fixture(:"image.png", "image.json")
      generate_workfile_fixture(:"binary.tar.gz", "binary.json")
      generate_workfile_fixture(:"tableau", "tableau.json")
    end
  end

  describe "#create" do
    let(:params) { {
      :workspace_id => workspace.to_param,
      :description => "Nice workfile, good workfile, I've always wanted a workfile like you",
          :versions_attributes => [{:contents => file}]
    } }

    it_behaves_like "an action that requires authentication", :post, :create

    context "as a member of the workspace" do
      it "creates a workfile" do
        post :create, params
        Workfile.last.file_name.should == "workfile.sql"
      end

      it "sets has_added_workfile on the workspace to true" do
        post :create, params
        workspace.reload.has_added_workfile.should be_true
      end

      it "makes a WorkfileCreated event" do
        post :create, params
        event = Events::WorkfileCreated.by(user).first
        event.workfile.description.should == params[:description]
        event.additional_data["commit_message"].should == params[:description]
        event.workspace.to_param.should == params[:workspace_id]
      end

      it "creates a workfile from an svg document" do
        post :create, :workspace_id => workspace.to_param, :file_name => 'some_vis.png', :svg_data => '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
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
