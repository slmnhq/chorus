require 'spec_helper'

describe Hdfs::ExternalTableCreator do
  let(:hdfs_file) { hdfs_entries(:hdfs_file) }
  let(:user) {users(:owner)}
  let(:table_name) {"top_songs"}

  describe ".create" do
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

    context "with a real greenplum database connection", :database_integration => true do
      let(:workspace) { workspaces(:public).tap {|ws| ws.update_attribute(:sandbox, schema) } }
      let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
      let(:schema) { database.schemas.find_by_name('test_schema') }
      let(:account) { GpdbIntegration.real_gpdb_account }

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

      it "returns a new, persisted hdfs entry" do
        Dataset.find_by_name(table_name).should be_nil
        Hdfs::ExternalTableCreator.create(workspace, account, parameters, account.owner).tap do |dataset|
          dataset.should be_a(GpdbTable)
          dataset.name.should == table_name
          dataset.schema.should == workspace.sandbox
          dataset.should be_persisted
        end
      end

      it "creates a WorkspaceAddHdfsAsExtTable event" do
        dataset = Hdfs::ExternalTableCreator.create(workspace, account, parameters, user)
        Events::WorkspaceAddHdfsAsExtTable.last.tap do |event|
          event.hdfs_file.should == hdfs_file
          event.dataset.should == dataset
          event.workspace.should == workspace
        end
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

    context "tests that can be run without a database connection" do
      let(:account) {instance_accounts(:shared_instance_account)}
      let(:workspace) { workspaces(:public)}

      before do
        any_instance_of(Hdfs::ExternalTableCreator) do |instance|
          stub(instance).execute_query.with_any_args {}
        end
      end

      describe "checking sql" do
        after do
          any_instance_of(Hdfs::ExternalTableCreator) do |instance|
            mock.proxy(instance).create_sql.with_any_args do |sql_query|
              sql_query.should include(expected_sql_query)
            end
          end
          stub(Dataset).refresh(account, workspace.sandbox) {
            FactoryGirl.create :gpdb_table, :name => table_name, :schema => workspace.sandbox
            workspace.sandbox.datasets
          }
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
      end
    end
  end
end