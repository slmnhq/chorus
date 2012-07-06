require 'spec_helper'

resource "Greenplum Table" do
  let(:owner) { gpdb_table.schema.instance.owner }
  let(:gpdb_table) { FactoryGirl.create(:gpdb_table) }
  let(:table_id) { gpdb_table.to_param }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => gpdb_table.instance, :owner => owner) }

  before do
    any_instance_of(GpdbTable) do |gpdb_table|
      stub(gpdb_table).analyze(owner_account) { [] }
    end

    log_in owner
  end

  post "/tables/:table_id/analyze" do
    parameter :table_id, "Table ID"
    required_parameters :table_id

    example_request "Run analyze on the specified table" do
      status.should == 200
    end
  end
end