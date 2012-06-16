require 'spec_helper'

resource "Greenplum Tables / Views" do
  let(:dataset) { FactoryGirl.create(:gpdb_table, :name => "my_table") }
  let(:owner) { dataset.schema.instance.owner }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => dataset.instance, :owner => owner) }
  let(:result) do
    SqlResults.new(
      [
        { :name => "column_1", :data_type => "integer", :type_category => "WHOlE_NUMBER", :description => "first col" },
        { :name => "column_1", :data_type => "double", :type_category => "REAL_NUMBER", :description => "second col" }
      ],
      [[1, 2.0], [5, 2.5]]
    )
  end
  before do
    log_in owner
    stub(SqlResults).preview_dataset { result }
  end

  post "/database_objects/:database_object_id/previews" do
    parameter :database_object_id, "Table / Views ID"
    required_parameters :database_object_id
    let(:database_object_id) { dataset.id }

    example_request "Preview 100 rows" do
      status.should == 201
    end
  end
end