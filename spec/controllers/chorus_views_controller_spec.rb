require 'spec_helper'

describe ChorusViewsController, :database_integration => true do
  let(:account) { GpdbIntegration.real_gpdb_account }
  let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
  let(:schema) { database.schemas.find_by_name('test_schema') }
  let(:workspace) { workspaces(:bob_public)}
  let(:dataset) { datasets(:bobs_table) }
  let(:workfile) { workfiles(:bob_public) }

  before do
    log_in account.owner
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
        post :create, :chorus_view => options

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
        post :create, :chorus_view => options

        the_event = Events::Base.first
        the_event.action.should == "ChorusViewCreated"
        the_event.source_object.id.should == dataset.id
        the_event.source_object.should be_a(Dataset)
        the_event.workspace.id.should == workspace.id
      end

      generate_fixture "workspaceDataset/chorusView.json" do
        post :create, :chorus_view => options
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
        post :create, :chorus_view => options

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
        post :create, :chorus_view => options

        the_event = Events::Base.first
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
        post :create, :chorus_view => options
        response.code.should == "422"
        decoded = JSON.parse(response.body)
        decoded['errors']['fields']['query']['GENERIC'].should be_present
      end
    end
  end
end
