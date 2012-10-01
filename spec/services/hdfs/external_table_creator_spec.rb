require 'spec_helper'

describe Hdfs::ExternalTableCreator do
  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => "emc.com", :port => '8020') }
  subject { described_class.new('/file', hadoop_instance) }

  describe ".create" do
    let(:account) {instance_accounts(:shared_instance_account)}
    let(:user) {users(:owner)}
    let(:workspace) { workspaces(:public)}
    let(:hdfs_file) { hadoop_instance.hdfs_entries.create!({:path => "/foo_fighter/twisted_sisters/"}, :without_protection => true) }
    let(:table_name) {"highway_to_heaven"}
    let(:parameters) do
      {
          :hdfs_entry_id => hdfs_file.id,
          :has_header => true,
          :column_names => ["field1", "field2"],
          :types => ["text", "text"],
          :delimiter => ',',
          :table_name => table_name
      }
    end

    context "without a database connection" do
      before do
        any_instance_of(Hdfs::ExternalTableCreator) do |instance|
          stub(instance).execute_query.with_any_args {}
        end
      end

      it "creates a dataset" do
        Hdfs::ExternalTableCreator.create(workspace, account, parameters, user).tap do |dataset|
          dataset.should be_a(GpdbTable)
          dataset.name.should == "highway_to_heaven"
          dataset.schema.should == workspace.sandbox
          dataset.should == GpdbTable.last
        end
      end

      it "creates a WorkspaceAddHdfsAsExtTable event" do
        dataset = Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
        Events::WorkspaceAddHdfsAsExtTable.first.tap do |event|
          event.hdfs_file.path.should == "/foo_fighter/twisted_sisters/"
          event.hdfs_file.hadoop_instance_id.should == hadoop_instance.id
          event.dataset.should == dataset
          event.workspace.should == workspace
        end
      end

      describe "checking sql" do
        after do
          any_instance_of(Hdfs::ExternalTableCreator) do |instance|
            mock.proxy(instance).create_sql.with_any_args do |sql_query|
              sql_query.should include(expected_sql_query)
            end
          end
          Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
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
            expect { Hdfs::ExternalTableCreator.create(workspace, account, parameters.except(missing_parameter), user)}.to raise_error { |error|
              error.errors.messages[:parameter_missing][0][1][:message].should == "Parameter #{missing_parameter} missing for Hdfs External Table"
              error.should be_a(ApiValidationError)
            }
          end
        end

        it "raises a validation error when column names does not match column types" do
          parameters[:column_names] = ["field1"]
          expect { Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)}.to raise_error { |error|
            error.errors.messages[:column_name_missing][0][1][:message].should == "Column names size should match column types for Hdfs External Table"
            error.should be_a(ApiValidationError)
          }
        end

        context "when a dataset of the same name already exists in the rails database" do
          let(:table_name) {"lowercase-table-name"}
          before do
            FactoryGirl.create :gpdb_table, :schema => workspace.sandbox, :name => table_name
          end

          it "fails validation" do
            expect {
              Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
            }.to raise_exception(ActiveRecord::RecordInvalid)
          end

          it "is not case-sensitive" do
            table_name.upcase!
            external_table = Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
            external_table.should be_valid
          end
        end
      end
    end

    context "with a real greenplum database connection", :database_integration => true do
      let(:workspace) { workspaces(:public).tap {|ws| ws.update_attribute(:sandbox, schema) } }
      let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
      let(:schema) { database.schemas.find_by_name('test_schema') }
      let(:account) { GpdbIntegration.real_gpdb_account }
      let!(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :host => HADOOP_TEST_INSTANCE, :port => '8020') }
      let(:table_name) {"top_songs"}

      let(:parameters) do
        {
            :hdfs_entry_id => hdfs_file.id,
            :has_header => true,
            :column_names => ["col1", "col2", "col3", "col4", "col5"],
            :types => ["text", "text", "text", "text", "text"],
            :delimiter => ',',
            :table_name => table_name
        }
      end

      before { drop_external_table table_name }
      after(:all) { drop_external_table table_name }

      it "creates an external table based on the gphdfs uri" do
        Hdfs::ExternalTableCreator.create(workspace, account, parameters, account.owner)
        table_exists?(table_name).should be_true
      end

      context "when validation fails" do
        before { parameters[:column_names] = ["this_column_name_does_not_match"] }

        it "does not create an external table" do
          table_exists?(table_name).should be_false
          expect {
            Hdfs::ExternalTableCreator.create(workspace, account, parameters, account.owner)
          }.to raise_exception(ApiValidationError)
          table_exists?(table_name).should be_false
        end
      end

      context "when a table of the same name already exists on the greenplum database" do
        before do
          Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
          GpdbTable.where(:name => table_name).delete_all # avoid local validation errors
        end

        it "raises an exception" do
          expect {
            Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
          }.to raise_error(Hdfs::ExternalTableCreator::AlreadyExists)
        end

        context "when the names differ in case" do
          let(:new_table_name) { table_name.upcase }
          before { drop_external_table new_table_name }
          after(:all) { drop_external_table new_table_name }

          it "it is still valid" do
            parameters[:table_name] = new_table_name
            external_table = Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
            external_table.should be_valid
            table_exists?(new_table_name).should be_true
          end
        end
      end

      def exec_query(query)
        schema.with_gpdb_connection(account) do |conn|
          conn.exec_query query
        end
      end

      def drop_external_table(table_name)
        exec_query("DROP EXTERNAL TABLE \"#{table_name}\"") rescue ActiveRecord::StatementInvalid
      end

      def table_exists?(table_name)
        exec_query "select * from \"#{table_name}\" limit 0"
        true
      rescue ActiveRecord::StatementInvalid
        false
      end
    end
  end
end