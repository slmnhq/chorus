require 'spec_helper'

resource "Greenplum DB: datasets" do
  let(:owner) { gpdb_table.schema.gpdb_instance.owner }
  let(:gpdb_table) { datasets(:table) }
  let(:table_id) { gpdb_table.to_param }
  let!(:owner_account) { gpdb_table.schema.gpdb_instance.account_for_user(owner) }

  let(:stats) do
    GpdbTableStatistics.new.tap do |statistics|
      statistics.table_type = 'MASTER_TABLE'
      statistics.table_name = 'sales'
      statistics.disk_size = '350 megabytes'
      statistics.rows = "6999"
      statistics.columns = "5"
      statistics.last_analyzed = Time.current
      statistics.partition_count = "366"
    end
  end

  before do
    any_instance_of(GpdbTable) do |gpdb_table|
      stub(gpdb_table).stats(owner_account) { stats }
    end

    log_in owner
  end

  get "/tables/:table_id/statistics" do
    parameter :table_id, "Table ID"
    required_parameters :table_id

    example_request "Retrieve table statistics" do
      status.should == 200
    end
  end
end