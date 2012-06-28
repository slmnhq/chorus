require 'spec_helper'

describe HdfsExternalTable do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => "emc.com", :port => '8020') }
  subject { described_class.new('/file', hadoop_instance) }

  context "#create" do
    context "header true and delimiter ','" do
      let(:parameters) do
        {
            :hadoop_instance_id => hadoop_instance.id,
            :path => "foo_fighter/twisted_sisters/",
            :has_header => true,
            :column_names => ["field1", "field2"],
            :types => ["text", "text"],
            :delimiter => ',',
            :table_name => "highway_to_heaven"
        }
      end

      it "builds the correct sql" do
        sql_query = HdfsExternalTable.create_sql(parameters)
        sql_query.should == "CREATE EXTERNAL TABLE highway_to_heaven (field1 text, field2 text) LOCATION ('gphdfs://emc.com:8020/foo_fighter/twisted_sisters/') "+
            "FORMAT 'TEXT' (DELIMITER ',' HEADER) SEGMENT REJECT LIMIT 2147483647"
      end
    end

    context "header false and delimiter ','" do
      let(:parameters) do
        {
            :hadoop_instance_id => hadoop_instance.id,
            :path => "foo_fighter/twisted_sisters/",
            :has_header => false,
            :column_names => ["field1", "field2"],
            :types => ["text", "text"],
            :delimiter => ',',
            :table_name => "highway_to_heaven"
        }
      end

      it "builds the correct sql" do
        sql_query = HdfsExternalTable.create_sql(parameters)
        sql_query.should == "CREATE EXTERNAL TABLE highway_to_heaven (field1 text, field2 text) LOCATION ('gphdfs://emc.com:8020/foo_fighter/twisted_sisters/') "+
            "FORMAT 'TEXT' (DELIMITER ',' ) SEGMENT REJECT LIMIT 2147483647"
      end
    end

    context "header true and delimiter '\\'" do
      let(:parameters) do
        {
            :hadoop_instance_id => hadoop_instance.id,
            :path => "foo_fighter/twisted_sisters/",
            :has_header => true,
            :column_names => ["field1", "field2"],
            :types => ["text", "text"],
            :delimiter => "\\",
            :table_name => "highway_to_heaven"
        }
      end

      it "builds the correct sql" do
        sql_query = HdfsExternalTable.create_sql(parameters)
        sql_query.should == "CREATE EXTERNAL TABLE highway_to_heaven (field1 text, field2 text) LOCATION ('gphdfs://emc.com:8020/foo_fighter/twisted_sisters/') "+
            "FORMAT 'TEXT' (DELIMITER '\\' HEADER) SEGMENT REJECT LIMIT 2147483647"
      end
    end

    context "validate parameters" do
      let(:parameters) do
        {
            :hadoop_instance_id => hadoop_instance.id,
            :path => "foo_fighter/twisted_sisters/",
            :has_header => true,
            :column_names => ["field1", "field2"],
            :types => ["text", "text"],
            :delimiter => ',',
            :table_name => "highway_to_heaven"
        }
      end

      it "fails when missing attributes" do
        expect { HdfsExternalTable.create_sql(parameters.except(:delimiter)) }.to raise_error(ApiValidationError)
        expect { HdfsExternalTable.create_sql(parameters.except(:path)) }.to raise_error(ApiValidationError)
        expect { HdfsExternalTable.create_sql(parameters.except(:column_names)) }.to raise_error(ApiValidationError)
        expect { HdfsExternalTable.create_sql(parameters.except(:types)) }.to raise_error(ApiValidationError)
      end

      it "fails when column names does not match column types" do
        parameters[:column_names] = ["field1"]
        expect { HdfsExternalTable.create_sql(parameters) }.to raise_error(ApiValidationError)
      end
    end
  end

  describe "#execute_query" do
    let(:account) { FactoryGirl.build_stubbed(:instance_account) }
    before(:each) do
      stub_gpdb(account, "select * from 1" => [''])
    end

    it "fires the sql" do
      schema = Object.new
      mock(schema).with_gpdb_connection(account) { [''] }

      sql = "select * from q"
      expect { HdfsExternalTable.execute_query(sql, schema, account) }.to_not raise_error
    end

  end
end