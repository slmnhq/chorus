require 'spec_helper'

describe StatisticsController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  context "#show" do
    let(:schema) { gpdb_schemas(:default) }
    let(:instance_account) { schema.database.gpdb_instance.owner_account }
    let!(:table) { datasets(:table) }

    let(:metadata_sql) { Dataset::Query.new(schema).metadata_for_dataset("table").to_sql }
    let(:datasets_sql) { Dataset::Query.new(schema).tables_and_views_in_schema.to_sql }
    let(:metadata_info) {
      {
          'name' => 'table',
          'description' => 'a description',
          'definition' => nil,
          'column_count' => '3',
          'row_count' => '5',
          'table_type' => 'BASE_TABLE',
          'last_analyzed' => '2012-06-06 23:02:42.40264+00',
          'disk_size' => '500 kB',
          'partition_count' => '6'
      }
    }

    before do
      stub_gpdb(instance_account,
                datasets_sql => [
                    { 'type' => "r", "name" => "table", "master_table" => 't' }
                ],
                metadata_sql => [
                    metadata_info
                ]
      )
    end

    it "should retrieve the db object for a schema" do
      get :show, :dataset_id => table.to_param

      response.code.should == "200"
      decoded_response.columns.should == 3
      decoded_response.rows.should == 5
      decoded_response.description.should == 'a description'
      decoded_response.last_analyzed_time.to_s.should == "2012-06-06T23:02:42Z"
      decoded_response.on_disk_size.should == '500 kB'
      decoded_response.partitions.should == 6
    end

    generate_fixture "datasetStatisticsTable.json" do
      get :show, :dataset_id => table.to_param
    end

    context "generating statistics for a chorus view" do
      let(:metadata_info) {
        {
            'name' => 'table',
            'description' => 'a description',
            'definition' => nil,
            'column_count' => '3',
            'row_count' => '5',
            'table_type' => 'BASE_TABLE',
            'last_analyzed' => '2012-06-06 23:02:42.40264+00',
            'disk_size' => '500 kB',
            'partition_count' => '6',
            'definition' => 'Bobby DROP TABLES;'
        }
      }

      generate_fixture "datasetStatisticsView.json" do
        get :show, :dataset_id => table.to_param
      end
    end
  end
end
