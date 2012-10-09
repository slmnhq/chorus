require 'spec_helper'

describe WorkspacesController do
  ignore_authorization!

  let(:owner) { users(:no_collaborators) }
  let(:other_user) { users(:the_collaborator) }
  before do
    log_in owner
  end

  describe "#index" do
    let(:private_workspace) { workspaces(:private_with_no_collaborators) }

    it "returns workspaces that are public" do
      get :index
      response.code.should == "200"
      decoded_response.map(&:name).should include workspaces(:public).name
    end

    it "returns workspaces the user is a member of" do
      log_in other_user
      get :index
      response.code.should == "200"
      decoded_response.map(&:name).should include private_workspace.name
    end

    it "does not return private workspaces user is not a member of" do
      other_private = workspaces(:private)
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
      inaccessible_workspaces = other_user.workspaces - Workspace.accessible_to(owner)
      decoded_response.size.should == other_user.workspaces.count - inaccessible_workspaces.length
      decoded_response.map(&:name).should_not include(workspaces(:private).name)
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
      get :index, :show_latest_comments => 'true'
    end

  end

  describe "#create" do
    context "with valid parameters" do
      let(:params) { {:name => "foobar"} }
      it "creates a workspace" do
        expect {
          post :create, params
        }.to change(Workspace, :count).by(1)
      end

      it "creates an event for public workspace" do
        expect_to_add_event(Events::PublicWorkspaceCreated, owner) do
          post :create, params.merge(:public => true)
        end
      end

      it "creates an event for private workspace" do
        expect_to_add_event(Events::PrivateWorkspaceCreated, owner) do
          post :create, params.merge(:public => false)
        end
      end

      it "presents the workspace" do
        mock_present do |workspace|
          workspace.should be_a(Workspace)
          workspace.name.should == "foobar"
        end
        post :create, params
      end

      it "adds the owner as a member of the workspace" do
        post :create, params
        Workspace.last.memberships.first.user.should == owner
      end

      it "sets the authenticated user as the owner of the new workspace" do
        post :create, params
        Workspace.last.owner.should == owner
      end
    end
  end

  describe "#show" do
    let(:owner) { users(:owner) }
    let(:workspace) { workspaces(:public) }

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
        mock.proxy(controller).present(workspace, :presenter_options => {:show_latest_comments => false})
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
      get :show, :id => workspace.to_param, :show_latest_comments => 'true'
    end
  end

  #Add contexts for the different params and workspaces
  describe "#update" do
    let(:public_workspace) { workspaces(:public_with_no_collaborators) }
    let(:private_workspace) { workspaces(:private_with_no_collaborators) }
    let(:workspace) {private_workspace}

    let(:params) { {
        :id => workspace.id,
        :owner => {id: "3"},
        :public => workspace.public?.to_s,
        :archived => workspace.archived?.to_s
    } }

    context "when the current user has update authorization" do
      it "uses authentication" do
        mock(subject).authorize!(:update, workspace)
        put :update, params
      end

      it "can change the owner" do
        member = users(:the_collaborator)
        put :update, params.merge(:owner_id => member.id.to_s)

        workspace.reload
        workspace.owner.should == member
        response.should be_success
      end

      context "changing a public workspace" do
        let(:workspace) {public_workspace}

        it "allows updating the workspace's privacy" do
          put :update, params.merge(:public => false)
          workspace.reload
          workspace.should_not be_public
          response.should be_success
        end

        it "generates an event" do
          expect_to_add_event(Events::WorkspaceMakePrivate, owner) do
            put :update, params.merge(:public => false)
          end
        end
      end

      context "changing a private workspace" do
        let(:workspace) {private_workspace}

        it "allows updating the workspace's privacy" do
          put :update, params.merge(:public => "true")

          workspace.reload
          workspace.should be_public
          response.should be_success
        end

        it "generates an event" do
          expect_to_add_event(Events::WorkspaceMakePublic, owner) do
            put :update, params.merge(:public => "true")
          end
        end
      end

      describe "unarchiving workspace" do
        let(:workspace) {workspaces(:archived)}

        it "unarchives the workspace" do
          put :update, params.merge(:archived => "false")
          workspace.reload
          workspace.archived_at.should be_nil
          workspace.archiver.should be_nil
          response.should be_success
        end

        it "generates an event" do
          expect_to_add_event(Events::WorkspaceUnarchived, owner) do
            put :update, params.merge(:archived => "false")
          end
        end
      end

      describe "archiving the workspace" do
        let(:workspace) { workspaces(:public) }

        it "archives the workspace" do
          put :update, params.merge(:archived => "true")
          workspace.reload
          workspace.archived_at.should be_within(1.minute).of(Time.now)
          workspace.archiver.should == owner
        end

        it "generates an event" do
          expect_to_add_event(Events::WorkspaceArchived, owner) do
            put :update, params.merge(:archived => "true")
          end
        end
      end

      it "allows changing the sandbox" do
        sandbox = gpdb_schemas(:other_schema)

        expect_to_add_event(Events::WorkspaceAddSandbox, owner) do
           put :update, params.merge(:sandbox_id => sandbox.to_param)
        end
        
        response.should be_success
        
        workspace.reload
        workspace.sandbox_id.should == sandbox.id
        workspace.has_added_sandbox.should == true
        workspace.has_changed_settings.should == false
      end
    end

    context "when new sandbox is a new schema in an existing database" do
      let(:database) { gpdb_databases(:default) }

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
      let(:gpdb_instance) { gpdb_instances(:owners) }
      let(:params) { {
          :id => workspace.id,
          :owner => {id: owner.id.to_s},
          :public => "false",
          :schema_name => "public",
          :database_name => "new_database",
          :instance_id => gpdb_instance.id
      } }

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
            FactoryGirl.create :gpdb_schema, :name => name, :database => database
          end
        end

        put :update, params.merge(:schema_name => "create_new_schema")

        workspace.reload.sandbox.tap do |sandbox|
          sandbox.name.should == "create_new_schema"
          sandbox.database.name.should == "new_database"
        end
      end

      it "does not call create_schema if the schema is public" do
        any_instance_of(GpdbInstance) do |instance_double|
          stub(instance_double).create_database("new_database", gpdb_instance.owner) do |name|
            database = FactoryGirl.create :gpdb_database, :name => name, :gpdb_instance => gpdb_instance
            schema = FactoryGirl.create :gpdb_schema, :name => "public", :database => database
            database
          end
        end
        any_instance_of(GpdbDatabase) do |database_double|
          mock(database_double).create_schema.with_any_args.times(0)
        end

        put :update, params
        response.should be_success
        workspace.reload.sandbox.tap do |sandbox|
          sandbox.name.should == "public"
          sandbox.database.name.should == "new_database"
        end
      end

      it "returns an error if creation fails" do
        any_instance_of(GpdbInstance) do |gpdb_instance|
          stub(gpdb_instance).create_database.with_any_args {
            raise Exception.new("Database creation failed")
          }
        end

        put :update, params.merge(:schema_name => "create_new_schema")
        response.code.should == "422"
        decoded_errors.fields.database.GENERIC.message.should == "Database creation failed"
      end
    end
  end

  def expect_to_add_event(event_class, owner)
    expect {
      expect {
        yield
      }.to change(Events::Base, :count).by(1) # generates a single event
    }.to change(event_class.by(owner), :count).by(1)
  end
end
