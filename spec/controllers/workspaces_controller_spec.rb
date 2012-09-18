require 'spec_helper'

describe WorkspacesController do
  ignore_authorization!

  let(:owner) { users(:no_collaborators) }
  let(:other_user) { users(:carly) }
  before do
    log_in owner
  end

  describe "#index" do
    let(:private_workspace) { workspaces(:private_with_no_collaborators) }

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
        }.should change(Events::PublicWorkspaceCreated, :count).by(1)
      end

      it "creates an event for private workspace" do
        parameters = {:workspace => {:name => "foobar", :public => false}}
        lambda {
          post :create, parameters
        }.should change(Events::PrivateWorkspaceCreated, :count).by(1)
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
    let(:workspace) { workspaces(:public_with_no_collaborators) }

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
        workspace = workspaces(:private_with_no_collaborators)
        parameters = {:id => workspace.id, :workspace => {:public => true, :archived => workspace.archived?.to_s}}
        lambda {
          lambda {
            lambda {
              put :update, parameters
            }.should change(Events::WorkspaceMakePublic, :count).by(1)
          }.should_not change(Events::WorkspaceArchived, :count)
        }.should_not change(Events::WorkspaceUnarchived, :count)
      end

      it "makes the right event when making the workspace private" do
        parameters = {:id => workspace.id, :workspace => {:public => false, :archived => workspace.archived?.to_s}}
        lambda {
          lambda {
            lambda {
              put :update, parameters
            }.should change(Events::WorkspaceMakePrivate, :count).by(1)
          }.should_not change(Events::WorkspaceArchived, :count)
        }.should_not change(Events::WorkspaceUnarchived, :count)
      end

      it "allows archiving the workspace" do
        lambda {
          put :update, :id => workspace.id, :workspace => {
              :archived => "true"
          }
        }.should change(Events::WorkspaceArchived.by(owner), :count).by(1)

        workspace.reload
        workspace.archived_at.should_not be_nil
        workspace.archiver.should == owner
      end

      context "with an archived workspace" do
        it "makes the right event when making the workspace public" do
          workspace = workspaces(:archived)
          workspace.public = false
          workspace.save!

          parameters = {:id => workspace.id, :workspace => {:public => "true", :archived => workspace.archived?.to_s}}
          lambda {
            lambda {
              lambda {
                put :update, parameters
              }.should change(Events::WorkspaceMakePublic, :count).by(1)
            }.should_not change(Events::WorkspaceArchived, :count)
          }.should_not change(Events::WorkspaceUnarchived, :count)
        end

        it "makes the right event when making the workspace private" do
          workspace = workspaces(:archived)
          parameters = {:id => workspace.id, :workspace => {:public => "false", :archived => workspace.archived?.to_s}}
          lambda {
            lambda {
              lambda {
                put :update, parameters
              }.should change(Events::WorkspaceMakePrivate, :count).by(1)
            }.should_not change(Events::WorkspaceArchived, :count)
          }.should_not change(Events::WorkspaceUnarchived, :count)
        end
      end

      it "allows unarchiving the workspace" do
        workspace = workspaces(:archived)

        lambda {
          put :update, :id => workspace.id, :workspace => {
              :archived => "false"
          }
        }.should change(Events::WorkspaceUnarchived.by(owner), :count).by(1)

        workspace.reload
        workspace.archived_at.should be_nil
        workspace.archiver.should be_nil
      end

      it "allows changing the sandbox" do
        sandbox = gpdb_schemas(:other_schema)

        lambda {
          lambda {
            put :update, :id => workspace.id, :workspace => {
                :sandbox_id => sandbox.to_param
            }

            response.should be_success
          }.should change(Events::WorkspaceAddSandbox.by(owner), :count).by(1)
        }.should_not change(Events::WorkspaceUnarchived, :count)

        workspace.reload
        workspace.sandbox_id.should == sandbox.id
        workspace.has_added_sandbox.should == true
        workspace.has_changed_settings.should == false
      end
    end

    context "when new sandbox is a new schema in an existing database" do
      let!(:database) { gpdb_schemas(:other_schema).database }

      before do
        stub(GpdbSchema).refresh(anything, anything) { }
        log_in database.gpdb_instance.owner
      end
      it "calls create_schema" do
        any_instance_of(GpdbDatabase) do |db|
          stub(db).create_schema("create_new_schema", database.gpdb_instance.owner) do |name|
            database.schemas.create!({:name => name }, :without_protection => true)
          end
        end

        send_request

        workspace.reload.sandbox.tap do |sandbox|
          sandbox.name.should == "create_new_schema"
        end
      end

      it "returns an error if creation fails" do
        any_instance_of(GpdbDatabase) do |db|
          stub(db).create_schema.with_any_args {
            raise Exception.new("Schema creation failed")
          }
        end
        send_request
        response.code.should == "422"
        decoded_errors.fields.schema.GENERIC.message.should == "Schema creation failed"
      end

      def send_request
        put :update, :id => workspace.id, :workspace => {
            :owner => {id: owner.id.to_s},
            :public => "false",
            :schema_name => "create_new_schema",
            :database_id => database.id
        }
      end
    end

    context "when new sandbox is a new schema in a new database" do
      let(:gpdb_instance) { gpdb_instances(:bobs_instance) }

      before do
        stub(GpdbSchema).refresh(anything, anything) { }
        log_in gpdb_instance.owner
      end

      it "calls both create_database and create_schema" do

        any_instance_of(GpdbInstance) do |instance_double|
          mock(instance_double).create_database("new_database", gpdb_instance.owner) do |name|
            gpdb_instance.databases.create!({:name => name}, :without_protection => true)
          end
        end

        any_instance_of(GpdbDatabase) do |database_double|
          mock(database_double).create_schema("create_new_schema", gpdb_instance.owner) do |name|
            database = gpdb_instance.reload.databases.find_by_name("new_database")
            database.schemas.create!({:name => name}, :without_protection => true)
          end
        end

        send_request

        workspace.reload.sandbox.tap do |sandbox|
          sandbox.name.should == "create_new_schema"
          sandbox.database.name.should == "new_database"
        end
      end

      it "does not call create_schema if the schema name is public" do
        any_instance_of(GpdbInstance) do |instance_double|
          stub(instance_double).create_database("new_database", gpdb_instance.owner) do |name|
            database = gpdb_instance.databases.create!({:name => name}, :without_protection => true)
            database.schemas.create!({:name => "public"}, :without_protection => true)
            database
          end
        end
        create_schema_called = false
        any_instance_of(GpdbDatabase) do |database_double|
          stub(database_double).create_schema("public", gpdb_instance.owner) do |name|
            create_schema_called = true
          end
        end

        put :update, :id => workspace.id, :workspace => {
            :owner => {id: owner.id.to_s},
            :public => "false",
            :schema_name => "public",
            :database_name => "new_database",
            :instance_id => gpdb_instance.id
        }

        workspace.reload.sandbox.tap do |sandbox|
          sandbox.name.should == "public"
          sandbox.database.name.should == "new_database"
        end
        create_schema_called.should be_false
      end

      it "returns an error if creation fails" do
        any_instance_of(GpdbInstance) do |gpdb_instance|
          stub(gpdb_instance).create_database.with_any_args {
            raise Exception.new("Database creation failed")
          }
        end

        send_request
        response.code.should == "422"
        decoded_errors.fields.database.GENERIC.message.should == "Database creation failed"
      end

      def send_request
        put :update, :id => workspace.id, :workspace => {
            :owner => {id: owner.id.to_s},
            :public => "false",
            :schema_name => "create_new_schema",
            :database_name => "new_database",
            :instance_id => gpdb_instance.id
        }
      end
    end
  end
end
