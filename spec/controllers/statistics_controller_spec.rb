require 'spec_helper'

describe StatisticsController do
  let(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  context "#show" do
    let(:instance) { FactoryGirl.create(:instance, :owner_id => user.id) }
    let(:instanceAccount) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

    let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance, :name => "database1") }
    let(:schema) { FactoryGirl.create(:gpdb_schema, :name => 'schema1', :database => database) }
    let!(:table) { FactoryGirl.create(:gpdb_table, :name => 'table1', :schema => schema) }

    let(:metadata_sql) { Dataset::Query.new(schema).metadata_for_database_object("table1").to_sql }
    let(:db_objects_sql) { Dataset::Query.new(schema).tables_and_views_in_schema.to_sql }

    it "should retrieve the db object for a schema" do
      stub_gpdb(instanceAccount,
        db_objects_sql => [
                  { 'type' => "r", "name" => "table1", "master_table" => 't' }
                ],
        metadata_sql => [
          {
            'name' => 'table1',
            'description' => 'table1 is cool',
            'definition' => nil,
            'column_count' => '3',
            'row_count' => '5',
            'table_type' => 'BASE_TABLE',
            'last_analyzed' => '2012-06-06 23:02:42.40264+00',
            'disk_size' => '500 kB',
            'partition_count' => '6'
          }
        ]
      )
      get :show, :database_object_id => table.to_param

      response.code.should == "200"
      decoded_response.columns.should == 3
      decoded_response.rows.should == 5
      decoded_response.description.should == 'table1 is cool'
      decoded_response.last_analyzed_time.to_s.should == "2012-06-06T23:02:42Z"
      decoded_response.on_disk_size.should == '500 kB'
      decoded_response.partitions.should == 6
    end
  end
end
