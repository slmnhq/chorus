require 'spec_helper'

resource "Chorus Views" do
  let(:dataset) { datasets(:bobs_table) }
  let(:owner) { users(:bob) }
  let(:workspace) { workspaces(:bob_public) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => dataset.instance, :owner => owner) }
  let(:dataset_id) { dataset.id }

  before do
    log_in owner

    any_instance_of(GpdbSchema) do |schema|
      mock(schema).with_gpdb_connection.with_any_args
    end
  end

  parameter :id, "Id of the source dataset"
  parameter :object_name, "Name of the Chorus View to be created"
  parameter :schema_id, "Id of the schema to run the view in"
  parameter :workspace_id, "Id of the workspace the Chorus View belongs to"
  parameter :query, "Sql statement of the Chorus View, must start with SELECT or WITH"

  required_parameters :id, :object_name, :schema_id, :workspace_id, :query

  scope_parameters :chorus_view, :all
  let(:id) { dataset_id }
  let(:workspace_id) { workspace.id }
  let(:object_name) {"MyChorusView"}
  let(:schema_id) {workspace.sandbox.id}
  let(:query) {"select 1;"}

  post "/datasets/:dataset_id/chorus_view" do
    example_request "Create a Chorus View" do

      status.should == 201
    end
  end
end