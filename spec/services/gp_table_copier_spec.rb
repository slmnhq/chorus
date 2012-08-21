require 'spec_helper'

describe GpTableCopier, :database_integration => true do
  def call_sql(sql_command, schema = schema, account = account)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query(sql_command)
    end
  end

  def distribution_key_sql(schema_name, table_name)
    <<-DISTRIBUTION_KEY_SQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(attrnums, 1)) AS rn
      FROM   gp_distribution_policy where localoid = '#{schema_name}.#{table_name}'::regclass
      ) y, pg_attribute WHERE attrelid = '#{schema_name}.#{table_name}'::regclass::oid AND attrnums[rn] = attnum ORDER by rn;
    DISTRIBUTION_KEY_SQL
  end

  let(:account) { GpdbIntegration.real_gpdb_account }
  let(:user) { account.owner }
  let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
  let(:schema) { database.schemas.find_by_name('test_schema') }
  let(:source_table_name) { "src_table" }
  let(:source_dataset) { schema.datasets.find_by_name(source_table_name) }
  let(:sandbox) { schema } # For testing purposes, src schema = sandbox
  let(:destination_table_name) { "dst_table" }
  let(:table_def) { '"id" integer, "name" text, "id2" integer, "id3" integer, PRIMARY KEY("id2", "id3", "id")' }
  let(:distrib_def) { 'DISTRIBUTED BY("id2", "id3")' }
  let(:options) { {"workspace_id" => workspace.id, "to_table" => destination_table_name, "new_table" => "true" }.merge(extra_options) }
  let(:extra_options) { {} }
  let(:copier) { GpTableCopier.new(source_dataset.id, user.id, options) }
  let(:add_rows) { true }
  let(:workspace) { FactoryGirl.create :workspace, :owner => user, :sandbox => sandbox }
  let(:attributes) { {} }

  before do
    refresh_chorus
  end

  after do
    call_sql("DROP TABLE IF EXISTS \"#{schema.name}\".\"#{source_table_name}\";")
    call_sql("DROP TABLE IF EXISTS \"#{sandbox.name}\".\"#{destination_table_name}\";") unless (
      (destination_table_name ==  source_table_name) || destination_table_name == "other_base_table")
  end

  context "actually running the query" do
    before do
      call_sql("drop table if exists \"#{source_table_name}\";")
      call_sql("drop table if exists \"#{destination_table_name}\";")
      call_sql("create table \"#{source_table_name}\"(#{table_def}) #{distrib_def};")
      Dataset.refresh(account, schema)
      if add_rows
        call_sql("insert into \"#{source_table_name}\"(id, name, id2, id3) values (1, 'marsbar', 3, 5);")
        call_sql("insert into \"#{source_table_name}\"(id, name, id2, id3) values (2, 'kitkat', 4, 6);")
      end
    end

    context ".run_import" do
      before do
        dataset_import_created_event_id = Events::DATASET_IMPORT_CREATED.by(user).add(
            :workspace => workspace,
            :dataset => nil,
            :destination_table => dst_table_name
        )
        attributes.merge!(:dataset_import_created_event_id => dataset_import_created_event_id)
      end

      context "in new table" do

        it "creates a new table copier and runs it" do
          GpTableCopier.run_import(source_dataset.id, user.id, options)
          dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
          dest_rows.count.should == 2
        end

        it "creates a DatasetImportSuccess on a successful import" do
          GpTableCopier.run_import(source_dataset.id, user.id, options)
          event = Events::DatasetImportSuccess.first
          event.actor.should == user
          event.dataset.name.should == destination_table_name
          event.dataset.schema.should == sandbox
          event.workspace.should == workspace
          event.source_dataset.should == source_dataset
          event.source_dataset_id.should == source_dataset.id
        end

        it "creates a DatasetImportFailed on a failed import" do
          GpTableCopier.run_import(-1, user.id, options)
          event = Events::DatasetImportFailed.first
          event.actor.should == user
          event.error_message.should == "Couldn't find Dataset with id=-1"
          event.workspace.should == workspace
          event.source_dataset.should == nil
          event.destination_table.should == destination_table_name
        end

        it "sets the dataset attribute of the DATASET_IMPORT_CREATED event on a successful import" do
          GpTableCopier.run_import(schema.id, src_table_name, workspace.id, dst_table_name, user.id, attributes)
          event = Events::DATASET_IMPORT_CREATED.first
          event.id = attributes[:dataset_import_created_event_id]
          event.actor.should == user
          event.dataset.name.should == dst_table_name
          event.dataset.schema.should == sandbox
          event.workspace.should == workspace
        end
      end

      context "in existing table" do
        let(:extra_options) { {"new_table" => "false" } }
        before do
          call_sql("create table \"#{destination_table_name}\"(#{table_def}) #{distrib_def};")
        end

        it "creates a existing table copier and runs it" do
          GpTableCopier.run_import(source_dataset.id, user.id, options)
          dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
          dest_rows.count.should == 2
        end

        context "when it should truncate" do
          let(:extra_options) { {"new_table" => "false", "truncate" => "true" } }
          before do
            call_sql("insert into \"#{destination_table_name}\"(id, name, id2, id3) values (11, 'marsbar-1', 31, 51);")
          end

          it "it truncates the destination table and import fresh" do
            dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
            dest_rows.count.should == 1
            GpTableCopier.run_import(source_dataset.id, user.id, options)
            dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
            dest_rows.count.should == 2
          end

        end

        context "when it should not truncate" do
          let(:extra_options) { {"new_table" => "false", "truncate" => "false" } }
          before do
            call_sql("insert into \"#{destination_table_name}\"(id, name, id2, id3) values (11, 'marsbar-1', 31, 51);")
          end

          it "it truncates the destination table and import fresh" do
            dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
            dest_rows.count.should == 1
            GpTableCopier.run_import(source_dataset.id, user.id, options)
            dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
            dest_rows.count.should == 3
          end

        end

        it "creates a DatasetImportSuccess on a successful import" do
          GpTableCopier.run_import(source_dataset.id, user.id, options)
          event = Events::DatasetImportSuccess.first
          event.actor.should == user
          event.dataset.name.should == destination_table_name
          event.dataset.schema.should == sandbox
          event.workspace.should == workspace
          event.source_dataset.should == source_dataset
          event.source_dataset_id.should == source_dataset.id
        end

        it "creates a DatasetImportFailed on a failed import" do
          GpTableCopier.run_import(-1, user.id, options)
          event = Events::DatasetImportFailed.first
          event.actor.should == user
          event.error_message.should == "Couldn't find Dataset with id=-1"
          event.workspace.should == workspace
          event.source_dataset.should == nil
          event.destination_table.should == destination_table_name
        end
      end
    end

    context "with standard input" do
      before do
        copier.run
        GpdbTable.refresh(account, schema)
      end

      it "creates the new table" do
        database.find_dataset_in_schema(destination_table_name, sandbox.name).should be_a(GpdbTable)
      end

      it "copies the constraints" do
        dest_constraints = call_sql("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{destination_table_name}'", sandbox)
        src_constraints = call_sql("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{source_table_name}'")

        dest_constraints.count.should == src_constraints.count
        dest_constraints.each_with_index do |constraint, i|
          constraint["constraint_type"].should == src_constraints[i]["constraint_type"]
          constraint["table_name"].should == destination_table_name
        end
      end

      it "copies the distribution keys" do
        dest_distribution_keys = call_sql(distribution_key_sql(sandbox.name, destination_table_name), sandbox)
        src_distribution_keys = call_sql(distribution_key_sql(schema.name, source_table_name))

        dest_distribution_keys.should == src_distribution_keys
      end


      it "copies the rows" do
        dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
        dest_rows.count.should == 2
      end
    end

    context "when the rows are limited" do
      let(:extra_options) { { "sample_count" => 1 } }

      before do
        copier.run
        GpdbTable.refresh(account, schema)
      end

      it "copies the rows up to limit" do
        dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
        dest_rows.count.should == 1
      end

      context "when the row limit value is 0" do
        let(:extra_options) { { "sample_count" => 0 } }

        it "creates the table and copies 0 rows" do
          dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
          dest_rows.count.should == 0
        end
      end
    end

    context "when the sandbox and src schema are not the same" do
      let(:sandbox) { database.schemas.find_by_name('test_schema2') }
      before { attributes.merge!(:new_table => true) }

      it "creates a new table in the correct schema" do
        copier.run
        GpdbTable.refresh(account, sandbox)

        database.find_dataset_in_schema(destination_table_name, sandbox.name).should be_a(GpdbTable)
        dest_rows = call_sql("SELECT * FROM #{destination_table_name}", sandbox)
        dest_rows.count.should == 2
      end

      it "populates the activity properly" do
        GpTableCopier.run_import(source_dataset.id, user.id, options)
        event = Events::DatasetImportSuccess.first
        dataset_import_created_event_id = Events::DatasetImportCreated.by(user).add(
            :workspace => workspace,
            :dataset => nil,
            :destination_table => dst_table_name
        )
        attributes.merge!(:dataset_import_created_event_id => dataset_import_created_event_id)

        GpTableCopier.run_import(schema.id, src_table_name, workspace.id, dst_table_name, user.id, attributes)
        event = Events::DatasetImportSuccess.first
        event.actor.should == user
        event.dataset.name.should == destination_table_name
        event.dataset.schema.should == sandbox
        event.workspace.should == workspace
        event.source_dataset.should == source_dataset
      end

      context "when the destination table already exists" do
        let(:destination_table_name) { "other_base_table" }

        it "does not import the table raises an exception" do
          original_columns = call_sql("select column_name,* from information_schema.columns where table_name = '#{destination_table_name}';", sandbox)

          expect { copier.run }.to raise_exception
          columns = call_sql("select column_name,* from information_schema.columns where table_name = '#{destination_table_name}';", sandbox)
          columns.should == original_columns
          columns.count.should_not == 4
        end
      end
    end

    context "when the src and dst tables are the same" do
      let(:destination_table_name) { source_table_name }

      it "raises an exception" do
        expect { copier.run }.to raise_exception
      end
    end

    context "tables have weird characters" do
      let(:source_table_name) { "2candy" }
      let(:destination_table_name) { "2dst_candy" }

      it "single quotes table and schema names if they have weird chars" do
        copier.run

        call_sql("SELECT * FROM #{copier.destination_table_fullname}").length.should == 2
      end
    end

    context "when the source table is empty" do
      let(:add_rows) { false }

      it "creates an empty destination table" do
        copier.run
        call_sql("SELECT * FROM #{copier.destination_table_fullname}").length.should == 0
      end
    end

    context "for a table with 1 column and no primary key, distributed randomly" do
      let(:add_rows) { false }
      let(:table_def) { '"2id" integer' }
      let(:distrib_def) { 'DISTRIBUTED RANDOMLY' }

      it "should have DISTRIBUTED RANDOMLY for its distribution key clause" do
        copier.distribution_key_clause.should == "DISTRIBUTED RANDOMLY"
      end
    end

    context "when the import failed" do
      before do
        mock(copier).execute_sql(anything, anything) { raise StandardError, 'Internal Error' }
      end

      it "display the sql error message" do
        lambda { copier.run }.should raise_error(GpTableCopier::ImportFailed, "Internal Error")
      end
    end
  end
end
