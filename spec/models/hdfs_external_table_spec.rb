require 'spec_helper'

describe HdfsExternalTable do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => "emc.com", :port => '8020') }
  subject { described_class.new('/file', hadoop_instance) }

  describe ".create" do
    let(:account) {instance_accounts(:admin)}
    let(:user) {users(:owner)}
    let(:workspace) { workspaces(:bob_public)}
    let(:hdfs_file) { hadoop_instance.hdfs_entries.create!({:path => "/foo_fighter/twisted_sisters/"}, :without_protection => true) }
    let(:parameters) do
      {
          :hdfs_entry_id => hdfs_file.id,
          :has_header => true,
          :column_names => ["field1", "field2"],
          :types => ["text", "text"],
          :delimiter => ',',
          :table_name => "highway_to_heaven"
      }
    end

    context "without a database connection" do
      before do
        stub(HdfsExternalTable).execute_query.with_any_args {}
      end

      it "creates a dataset" do
        dataset = HdfsExternalTable.create(workspace, account, parameters, user)
        GpdbTable.last.tap do |new_dataset|
          new_dataset.name.should == "highway_to_heaven"
          new_dataset.should == dataset
        end
      end

      it "creates a WorkspaceAddHdfsAsExtTable event" do
        dataset = HdfsExternalTable.create(workspace, account, parameters, user)
        Events::WorkspaceAddHdfsAsExtTable.first.tap do |event|
          event.hdfs_file.path.should == "/foo_fighter/twisted_sisters/"
          event.hdfs_file.hadoop_instance_id.should == hadoop_instance.id
          event.dataset.should == dataset
          event.workspace.should == workspace
        end
      end

      describe "checking sql" do
        after do
          mock.proxy(HdfsExternalTable).create_sql.with_any_args do |sql_query|
            sql_query.should include(expected_sql_query)
          end
          HdfsExternalTable.create(workspace, account, parameters, user)
        end

        context "when header is true and delimiter is ','" do
          before { parameters.merge!(:has_header => true, :delimiter => ",")}
          let (:expected_sql_query) { "(DELIMITER ',' HEADER)" }
          it "generates correct sql" do end
        end

        context "when header is false and delimiter ','" do
          before { parameters.merge!(:has_header => false, :delimiter => ",")}
          let (:expected_sql_query) { "(DELIMITER ',' )" }
          it "generates correct sql" do end
        end

        context "when header is true and delimiter is '\\'" do
          before { parameters.merge!(:has_header => true, :delimiter => "\\")}
          let (:expected_sql_query) { "(DELIMITER '\\' HEADER)" }
          it "generates correct sql" do end
        end
      end

      describe "validating parameters" do
        [:hdfs_entry_id, :has_header, :column_names, :types, :delimiter, :table_name].each do |missing_parameter|
          it "raises a validation error when missing parameter #{missing_parameter}" do
            expect { HdfsExternalTable.create(workspace, account, parameters.except(missing_parameter), user)}.to raise_error { |error|
              error.errors.messages[:parameter_missing][0][1][:message].should == "Parameter #{missing_parameter} missing for Hdfs External Table"
              error.should be_a(ApiValidationError)
            }
          end
        end

        it "raises a validation error when column names does not match column types" do
          parameters[:column_names] = ["field1"]
          expect { HdfsExternalTable.create(workspace, account, parameters, user)}.to raise_error { |error|
            error.errors.messages[:column_name_missing][0][1][:message].should == "Column names size should match column types for Hdfs External Table"
            error.should be_a(ApiValidationError)
          }
        end
      end
    end

    context "with a real greenplum database connection", :database_integration => true do
      let(:workspace) { FactoryGirl.create(:workspace, :sandbox => schema) }
      let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
      let(:schema) { database.schemas.find_by_name('test_schema') }
      let(:account) { GpdbIntegration.real_gpdb_account }
      let!(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => HADOOP_TEST_INSTANCE, :port => '8020') }

      let(:parameters) do
        {
            :hdfs_entry_id => hdfs_file.id,
            :has_header => true,
            :column_names => ["col1", "col2", "col3", "col4", "col5"],
            :types => ["text", "text", "text", "text", "text"],
            :delimiter => ',',
            :table_name => "top_songs"
        }
      end

      after do
        schema.with_gpdb_connection(account) do |conn|
          conn.exec_query("DROP EXTERNAL TABLE top_songs")
        end
      end

      describe "HdfsExternalTable" do
        it "creates an external table based on the gphdfs uri" do
          HdfsExternalTable.create(workspace, account, parameters, account.owner)

          schema.with_gpdb_connection(account) do |conn|
            expect { conn.exec_query("select * from top_songs limit 0") }.to_not raise_error(ActiveRecord::StatementInvalid)
          end
        end
      end
    end
  end

  describe ".execute_query" do
    let(:account) { FactoryGirl.build_stubbed(:instance_account) }
    before(:each) do
      stub_gpdb(account, "select * from 1" => [''])
    end

    it "runs the sql" do
      schema = Object.new
      mock(schema).with_gpdb_connection(account) { [''] }

      sql = "select * from q"
      expect { HdfsExternalTable.execute_query(sql, schema, account) }.to_not raise_error
    end

    context "when the connection fails" do
      it "raises the creation failed exception" do
        schema = Object.new
        mock(schema).with_gpdb_connection(account) { raise StandardError }

        sql = "select * from q"
        expect { HdfsExternalTable.execute_query(sql, schema, account) }.to raise_error(HdfsExternalTable::CreationFailed)
      end
    end

    context "when the table already exists" do
      it "raises the existing table exception" do
        schema = Object.new
        mock(schema).with_gpdb_connection(account) { raise StandardError, 'relation table already exists' }

        sql = "select * from q"
        expect { HdfsExternalTable.execute_query(sql, schema, account) }.to raise_error(HdfsExternalTable::AlreadyExists)
      end
    end
  end
end
