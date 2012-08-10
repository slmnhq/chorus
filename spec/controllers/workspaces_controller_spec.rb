require 'spec_helper'

describe WorkspacesController do
  ignore_authorization!

  let(:owner) { users(:alice) }
  let(:other_user) { users(:carly) }
  before do
    log_in owner
  end

  describe "#index" do
    let(:private_workspace) { workspaces(:alice_private) }

    it "returns workspaces that are public" do
      get :index
      response.code.should == "200"
      decoded_response.map(&:name).should include workspaces(:bob_public).name
    end

    it "returns workspaces the user is a member of" do
      log_in other_user
      get :index
      response.code.should == "200"
      decoded_response.map(&:name).should include private_workspace.name
    end

    it "does not return private workspaces user is not a member of" do
      other_private = workspaces(:bob_private)
      get :index
      decoded_response.collect(&:name).should_not include other_private.name
    end

    it "includes private workspaces owned by the authenticated user" do
      get :index
      decoded_response.collect(&:name).should include private_workspace.name
    end

    it "sorts by workspace name" do
      get :index
      decoded_response[0].name.downcase.should < decoded_response[1].name.downcase
    end

    it "scopes by active status" do
      get :index, :active => 1
      decoded_response.size.should == Workspace.workspaces_for(owner).active.count
    end

    it "scopes by memberships" do
      get :index, :user_id => other_user.id
      decoded_response.size.should == other_user.workspaces.count - 1
      decoded_response.map(&:name).should_not include(workspaces(:bob_private).name)
    end

    it "shows admins all workspaces scoped by membership" do
      log_in users(:admin)
      get :index, :user_id => other_user.id
      decoded_response.size.should == other_user.workspaces.count
    end

    describe "pagination" do

      it "paginates the collection" do
        get :index, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.first.name.should == Workspace.workspaces_for(owner).order("lower(name) ASC")[2].name
      end

      it "defaults the per_page to fifty" do
        get :index
        request.params[:per_page].should == 50
      end
    end

    generate_fixture "workspaceSet.json" do
      get :index
    end

  end

  describe "#create" do
    context "with valid parameters" do
      let(:parameters) { {:workspace => {:name => "foobar"}} }

      it "creates a workspace" do
        lambda {
          post :create, parameters
        }.should change(Workspace, :count).by(1)
      end

      it "creates an event for public workspace" do
        parameters = {:workspace => {:name => "foobar", :public => true}}
        lambda {
          post :create, parameters
        }.should change(Events::PUBLIC_WORKSPACE_CREATED, :count).by(1)
      end

      it "creates an event for private workspace" do
        parameters = {:workspace => {:name => "foobar", :public => false}}
        lambda {
          post :create, parameters
        }.should change(Events::PRIVATE_WORKSPACE_CREATED, :count).by(1)
      end

      it "presents the workspace" do
        post :create, parameters
        parameters[:workspace].keys.each do |key|
          decoded_response[key].should == parameters[:workspace][key]
        end
      end

      it "adds the owner as a member of the workspace" do
        post :create, parameters
        Workspace.last.memberships.first.user.should == owner
      end

      it "sets the authenticated user as the owner of the new workspace" do
        post :create, parameters
        Workspace.last.owner.should == owner
      end
    end
  end

  describe "#show" do
    let(:workspace) { workspaces(:bob_public) }

    context "with a valid workspace id" do
      it "uses authentication" do
        mock(subject).authorize!(:show, workspace)
        get :show, :id => workspace.to_param
      end

      it "succeeds" do
        get :show, :id => workspace.to_param
        response.should be_success
      end

      it "presents the workspace" do
        mock.proxy(controller).present(workspace)
        get :show, :id => workspace.to_param
      end
    end

    context "with an invalid workspace id" do
      it "returns not found" do
        get :show, :id => 'bogus'
        response.should be_not_found
      end
    end

    generate_fixture "workspace.json" do
      get :show, :id => workspace.to_param
    end
  end

  describe "#update" do
    let(:workspace) { workspaces(:alice_public) }

    context "when the current user has update authorization" do
      it "uses authentication" do
        mock(subject).authorize!(:update, workspace)
        put :update, :id => workspace.id, :workspace => {
            :owner => {id: "3"},
            :public => "false"
        }
      end

      it "allows updating the workspace's privacy and owner" do
        member = users(:carly)
        put :update, :id => workspace.id, :workspace => {
            :owner_id => member.id.to_s,
            :public => "false"
        }

        workspace.reload
        workspace.should_not be_public
        workspace.owner.should == member
        response.should be_success
      end

      it "makes the right event when making the workspace public" do
        workspace = workspaces(:alice_private)
        parameters = {:id => workspace.id, :workspace => {:public => true}}
        lambda {
          put :update, parameters
        }.should change(Events::WORKSPACE_MAKE_PUBLIC, :count).by(1)
      end

      it "makes the right event when making the workspace private" do
        parameters = {:id => workspace.id, :workspace => {:public => false}}
        lambda {
          put :update, parameters
        }.should change(Events::WORKSPACE_MAKE_PRIVATE, :count).by(1)
      end

      it "allows archiving the workspace" do
        lambda {
          put :update, :id => workspace.id, :workspace => {
              :archived => "true"
          }
        }.should change(Events::WORKSPACE_ARCHIVED.by(owner), :count).by(1)

        workspace.reload
        workspace.archived_at.should_not be_nil
        workspace.archiver.should == owner
      end

      it "allows unarchiving the workspace" do
        workspace = workspaces(:archived)

        lambda {
          put :update, :id => workspace.id, :workspace => {
              :archived => "false"
          }
        }.should change(Events::WORKSPACE_UNARCHIVED.by(owner), :count).by(1)

        workspace.reload
        workspace.archived_at.should be_nil
        workspace.archiver.should be_nil
      end

      it "allows changing the sandbox" do
        sandbox = gpdb_schemas(:other_schema)
        lambda {
          put :update, :id => workspace.id, :workspace => {
              :sandbox_id => sandbox.to_param
          }

          response.should be_success
        }.should change(Events::WORKSPACE_ADD_SANDBOX.by(owner), :count).by(1)

        workspace.reload
        workspace.sandbox_id.should == sandbox.id
        workspace.has_added_sandbox.should == true
        workspace.has_changed_settings.should == false
      end
    end

    context "user can create a new schema as sandbox" do
      let(:database) { gpdb_schemas(:other_schema).database }

      before do
        stub(subject).create_schema_in_gpdb("create_new_schema", database) {}
      end

      it "should create a GpdbSchema in Chorus meta data" do
        put :update, :id => workspace.id, :workspace => {
            :owner => {id: "3"},
            :public => "false",
            :schema_name => "create_new_schema",
            :database_id => database.id
        }

        workspace.reload
        schema = database.schemas.find_by_name("create_new_schema")
        workspace.sandbox.id.should == schema.id
        schema.name.should == "create_new_schema"
        schema.database.should == database
      end

      it "should clean up the greenplum schema if the Chorus meta data save fails" do
        stub(subject).create_schema_in_gpdb("create_new_schema", database) {}
        any_instance_of(GpdbSchema) { |schema| mock(schema).save! {
          raise ActiveRecord::RecordNotFound
        } }
        mock(subject).cleanup_schema_in_gpdb.with_any_args {}
        put :update, :id => workspace.id, :workspace => {
            :owner => {id: "3"},
            :public => "false",
            :schema_name => "create_new_schema",
            :database_id => database.id
        }
      end
    end
  end
end
