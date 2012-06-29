require 'spec_helper'

describe "External table specs", :type => :database_integration do
  let(:schema) { GpdbSchema.find_by_name('gpdb_test_schema') }
  let(:account) { real_gpdb_account }
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => "gillette", :port => '8020') }

  let(:parameters) do
    {
        :hadoop_instance_id => hadoop_instance.id,
        :path => "/data/Top_1_000_Songs_To_Hear_Before_You_Die.csv",
        :has_header => true,
        :column_names => ["col1", "col2", "col3", "col4", "col5"],
        :types => ["text", "text", "text", "text", "text"],
        :delimiter => ',',
        :table_name => "top_songs"
    }
  end

  before do
    refresh_chorus
  end

  describe "HdfsExternalTable" do
    it "creates an external table based on the gphdfs uri" do
      HdfsExternalTable.create(schema, account, parameters)

      schema.with_gpdb_connection(account) do |conn|
        expect { conn.exec_query("select * from top_songs limit 0") }.to_not raise_error(ActiveRecord::StatementInvalid)
      end
    end
  end
end