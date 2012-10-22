require 'spec_helper'

describe ChorusViewsController, :database_integration => true do
  let(:gpdb_instance) { GpdbIntegration.real_gpdb_instance }
  let(:account) { gpdb_instance.owner_account }
  let(:user) { account.owner }
  let(:database) { GpdbIntegration.real_database }
  let(:schema) { database.schemas.find_by_name('test_schema') }
  let(:workspace) { workspaces(:public) }
  let(:dataset) { datasets(:table) }
  let(:workfile) { workfiles(:public) }

  before do
    log_in user
  end

  context "#create" do
    context "when creating a chorus view from a dataset" do
      let(:options) {
        HashWithIndifferentAccess.new(
            :query => "Select * from base_table1",
            :schema_id => schema.id,
            :source_object_id => dataset.id,
            :source_object_type => 'dataset',
            :object_name => "my_chorus_view",
            :workspace_id => workspace.id
        )
      }

      it "creates a chorus view" do
        post :create, options

        chorus_view = Dataset.chorus_views.last
        chorus_view.name.should == "my_chorus_view"
        workspace.bound_datasets.should include(chorus_view)

        response.code.should == "201"
        decoded_response[:query].should == "Select * from base_table1"
        decoded_response[:schema][:id].should == schema.id
        decoded_response[:object_name].should == "my_chorus_view"
        decoded_response[:workspace][:id].should == workspace.id
      end

      it "creates an event" do
        post :create, options

        the_event = Events::Base.last
        the_event.action.should == "ChorusViewCreated"
        the_event.source_object.id.should == dataset.id
        the_event.source_object.should be_a(Dataset)
        the_event.workspace.id.should == workspace.id
      end

      generate_fixture "workspaceDataset/chorusView.json" do
        post :create, options
      end
    end

    context "when creating a chorus view from a workfile" do
      let(:options) {
        HashWithIndifferentAccess.new(
            :query => "Select * from base_table1",
            :schema_id => schema.id,
            :source_object_id => workfile.id,
            :source_object_type => 'workfile',
            :object_name => "my_chorus_view",
            :workspace_id => workspace.id
        )
      }

      it "creates a chorus view" do
        post :create, options

        chorus_view = Dataset.chorus_views.last
        chorus_view.name.should == "my_chorus_view"
        workspace.bound_datasets.should include(chorus_view)

        response.code.should == "201"
        decoded_response[:query].should == "Select * from base_table1"
        decoded_response[:schema][:id].should == schema.id
        decoded_response[:object_name].should == "my_chorus_view"
        decoded_response[:workspace][:id].should == workspace.id
      end

      it "creates an event" do
        post :create, options

        the_event = Events::Base.last
        the_event.action.should == "ChorusViewCreated"
        the_event.source_object.id.should == workfile.id
        the_event.source_object.should be_a(Workfile)
        the_event.workspace.id.should == workspace.id
      end
    end

    context "when query is invalid" do
      let(:options) {
        HashWithIndifferentAccess.new(
            :query => "Select * from non_existing_table",
            :schema_id => schema.id,
            :object_name => "invalid_chorus_view",
            :workspace_id => workspace.id,
            :source_object_id => dataset.id,
            :source_object_type => 'dataset'
        )
      }

      it "responds with unprocessible entity" do
        post :create, options
        response.code.should == "422"
        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['query']['GENERIC'].should be_present
      end
    end
  end

  describe "#update" do
    let(:chorus_view) do
      datasets(:chorus_view).tap { |c|
        c.schema = schema
        c.query = "select 1;"
        c.save!
      }
    end

    let(:options) do
      {
        :id => chorus_view.to_param,
        :workspace_dataset => {
            :query => 'select 2;'
        }
      }
    end

    it "updates the definition of chorus view" do
      put :update, options
      response.should be_success
      decoded_response[:query].should == 'select 2;'
      chorus_view.reload.query.should == 'select 2;'
    end

    it "creates an event" do
      put :update, options

      the_event = Events::Base.last
      the_event.action.should == "ChorusViewChanged"
      the_event.dataset.should == chorus_view
      the_event.actor.should == user
      the_event.workspace.should == workspace
    end

    context "as a user who is not a workspace member" do
      let(:user) { users(:not_a_member) }

      it "does not allow updating the chorus view" do
        put :update, :id => chorus_view.to_param,
            :workspace_dataset => {
              :query => 'select 2;'
            }
        response.should be_forbidden
        chorus_view.reload.query.should_not == 'select 2;'
      end
    end
  end

  describe "#destroy" do
    let(:chorus_view) do
      datasets(:chorus_view).tap { |c| c.schema = schema }
    end

    it "lets a workspace member soft delete a chorus view" do
      delete :destroy, :id => chorus_view.to_param
      response.should be_success
      chorus_view.reload.deleted?.should be_true
    end

    it "deletes the workspace association" do
      AssociatedDataset.find_by_dataset_id(chorus_view.id).should_not be_nil
      delete :destroy, :id => chorus_view.to_param
      response.should be_success
      AssociatedDataset.find_by_dataset_id(chorus_view.id).should be_nil
    end

    it "deletes any imports from that chorus view" do
      ImportSchedule.create!({
         :start_datetime => '2012-09-04 23:00:00-07',
         :end_date => '2012-12-04',
         :frequency => 'weekly',
         :workspace_id => workspace.id,
         :to_table => "new_table_for_import",
         :source_dataset_id => chorus_view.id,
         :truncate => 't',
         :new_table => 't',
         :user_id => user.id} , :without_protection => true)

      ImportSchedule.find_by_source_dataset_id(chorus_view.id).should_not be_nil
      delete :destroy, :id => chorus_view.to_param
      response.should be_success
      ImportSchedule.find_by_source_dataset_id(chorus_view.id).should be_nil
    end
  end

  describe "#convert" do
    let(:chorus_view) do
      datasets(:convert_chorus_view)
    end

    before do
      Gpdb::ConnectionBuilder.connect!(gpdb_instance, account, database.name) do |connection|
        connection.exec_query("DROP VIEW IF EXISTS \"test_schema\".\"Gretchen\"")
      end
      chorus_view.schema = schema
      chorus_view.save!
    end


    context "When there is no error in creation" do

      after do
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, account, database.name) do |connection|
          connection.exec_query("DROP VIEW IF EXISTS \"test_schema\".\"Gretchen\"")
        end
      end

      it "creates a database view" do
        expect {
          post :convert, :id => chorus_view.to_param, :object_name => "Gretchen"
        }.to change(GpdbView, :count).by(1)

        response.should be_success
      end
    end

    context "when create view statement causes an error" do
      before do
        any_instance_of(::ActiveRecord::ConnectionAdapters::JdbcAdapter) do |conn|
          stub(conn).exec_query { raise ActiveRecord::StatementInvalid }
        end
      end
      it "raises an Error" do
        expect {
          post :convert, :id => chorus_view.to_param, :object_name => "Gretchen"
        }.to change(GpdbView, :count).by(0)

        response.should_not be_success
      end
    end

    context "when database view already exists" do
      before do
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, account, database.name) do |connection|
          connection.exec_query("CREATE VIEW \"test_schema\".\"Gretchen\" AS SELECT 1")
        end
      end

      after do
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, account, database.name) do |connection|
          connection.exec_query("DROP VIEW IF EXISTS \"test_schema\".\"Gretchen\"")
        end
      end

      it "raises an Error" do
        expect {
          post :convert, :id => chorus_view.to_param, :object_name => "Gretchen"
        }.to change(GpdbView, :count).by(0)

        response.should_not be_success
      end

    end
  end
end
