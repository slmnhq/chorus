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

    describe "#create_dataset" do
      let(:schema) { FactoryGirl.create(:gpdb_schema) }
      let(:parameters) do { :table_name => "highway_to_heaven", :path => "/data/file.csv", :hadoop_instance_id => hadoop_instance.id } end
      let(:creator) { FactoryGirl.create(:user) }

      before do
        @dataset = HdfsExternalTable.create_dataset(schema, parameters[:table_name])
      end

      it "should create a dataset" do
        GpdbTable.last.should == @dataset
      end

      it "create a WORKSPACE_ADD_HDFS_AS_EXT_TABLE event" do
        workspace = FactoryGirl.create(:workspace, :sandbox => FactoryGirl.create(:gpdb_schema))
        HdfsExternalTable.create_event(@dataset, workspace, parameters, creator)
        event = Events::WORKSPACE_ADD_HDFS_AS_EXT_TABLE.last
        event.hadoop_instance_id.should == hadoop_instance.id
        event.path.should == "/data/"
        event.hdfs_file_name.should == "file.csv"
        event.dataset.should == @dataset
        event.workspace.should == workspace
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

    context "no exceptions occur" do
      it "fires the sql" do
        schema = Object.new
        mock(schema).with_gpdb_connection(account) { [''] }

        sql = "select * from q"
        expect { HdfsExternalTable.execute_query(sql, schema, account) }.to_not raise_error
      end
    end

    context "connection failed" do
      it "raises the creation failed exception" do
        schema = Object.new
        mock(schema).with_gpdb_connection(account) { raise StandardError }

        sql = "select * from q"
        expect { HdfsExternalTable.execute_query(sql, schema, account) }.to raise_error(HdfsExternalTable::CreationFailed)
      end
    end

    context "table exists" do
      it "raises the existing table exception" do
        schema = Object.new
        mock(schema).with_gpdb_connection(account) { raise StandardError, 'relation table already exists' }

        sql = "select * from q"
        expect { HdfsExternalTable.execute_query(sql, schema, account) }.to raise_error(HdfsExternalTable::AlreadyExists)
      end
    end
  end
end