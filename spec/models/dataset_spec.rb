require 'spec_helper'

describe Dataset do
  let(:account) { FactoryGirl.create(:instance_account) }
  let(:schema) { FactoryGirl.create(:gpdb_schema) }
  let(:datasets_sql) { Dataset::Query.new(schema).tables_and_views_in_schema.to_sql }
  let(:metadata_sql) { Dataset::Query.new(schema).metadata_for_tables(["view1", "table1"]).to_sql }

  describe "associations" do
    it { should belong_to(:schema) }
  end

  describe "workspace association" do
    let!(:dataset) { FactoryGirl.create :gpdb_table }
    let!(:workspace) { FactoryGirl.create :workspace }
    let!(:workspace2) { FactoryGirl.create :workspace }
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }
    let!(:association2) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace2) }

    it "belongs to multiple workspaces" do
      dataset.bound_workspaces.should == [workspace, workspace2]
    end
  end

  describe "validations" do
    it { should validate_presence_of :name }
  end

  describe ".with_name_like" do
    it "scopes objects by name" do
      FactoryGirl.create(:gpdb_table, :name => "match")
      FactoryGirl.create(:gpdb_table, :name => "nope")

      Dataset.with_name_like("match").count.should == 1
    end

    it "matches anywhere in the name, regardless of case" do
      FactoryGirl.create(:gpdb_table, :name => "amatCHingtable")

      Dataset.with_name_like("match").count.should == 1
      Dataset.with_name_like("MATCH").count.should == 1
    end

    it "returns all objects if name is not provided" do
      FactoryGirl.create(:gpdb_table)
      Dataset.with_name_like(nil).count.should == Dataset.count
    end
  end

  context ".refresh" do
    context "refresh once, without mark_stale flag" do
      before(:each) do
        stub_gpdb(account, datasets_sql => [
          {'type' => "r", "name" => "table1", "master_table" => 't'},
          {'type' => "v", "name" => "view1", "master_table" => 'f'}
        ])
      end

      it "creates new copies of the datasets in our db" do
        Dataset.refresh(account, schema)

        datasets = schema.datasets.order(:name)
        datasets.size.should == 2
        datasets.map(&:class).should == [GpdbTable, GpdbView]
        datasets.pluck(:name).should == ["table1", "view1"]
        datasets.pluck(:master_table).should == [true, false]
      end

      it "does not re-create datasets that already exist in our database" do
        Dataset.refresh(account, schema)
        lambda {
          Dataset.refresh(account, schema)
        }.should_not change(Dataset, :count)
      end

      it "does not reindex unmodified datasets" do
        Dataset.refresh(account, schema)
        any_instance_of(Dataset) do |dataset|
          dont_allow(dataset).solr_index
        end
        Dataset.refresh(account, schema)
      end
    end

    context "refreshing twice, marking records as stale" do
      it "creates new copies of the datasets in our db" do
        stub_gpdb(account, datasets_sql => [
            {'type' => "r", "name" => "table1", "master_table" => 't'},
            {'type' => "v", "name" => "view1", "master_table" => 'f'}
        ])
        Dataset.refresh(account, schema)
        stub_gpdb(account, datasets_sql => [
            {'type' => "r", "name" => "table1", "master_table" => 't'},
        ])
        now = Time.now
        Dataset.update_all(:stale_at => now)

        Dataset.refresh(account, schema, :mark_stale => true)

        datasets = schema.datasets.order(:name)
        datasets.size.should == 2
        datasets.find_by_name("table1").should_not be_stale
        datasets.find_by_name("view1").should be_stale
      end
    end
  end

  describe ".add_metadata!(dataset, account)" do
    let(:dataset) { FactoryGirl.create(:gpdb_table, :schema => schema, :name => "table1") }
    let(:metadata_sql) { Dataset::Query.new(schema).metadata_for_dataset("table1").to_sql }

    before(:each) do
      stub_gpdb(account,
                datasets_sql => [
                  {'type' => "r", "name" => "table1", "master_table" => 't'}
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
    end

    it "fills in the 'description' attribute of each db object in the relation" do
      Dataset.refresh(account, schema)
      dataset.add_metadata!(account)

      dataset.statistics.description.should == "table1 is cool"
      dataset.statistics.definition.should be_nil
      dataset.statistics.column_count.should == 3
      dataset.statistics.row_count.should == 5
      dataset.statistics.table_type.should == 'BASE_TABLE'
      dataset.statistics.last_analyzed.to_s.should == "2012-06-06 23:02:42 UTC"
      dataset.statistics.disk_size == '500 kB'
      dataset.statistics.partition_count == 6
    end
  end

  describe ".add_metadata! for a view" do
    let(:dataset) { FactoryGirl.create(:gpdb_view, :schema => schema, :name => "view1") }
    let(:metadata_sql) { Dataset::Query.new(schema).metadata_for_dataset("view1").to_sql }

    before(:each) do
      stub_gpdb(account,
                datasets_sql => [
                  {'type' => "v", "name" => "view1", }
                ],

                metadata_sql => [
                  {
                    'name' => 'view1',
                    'description' => 'view1 is super cool',
                    'definition' => 'SELECT * FROM users;',
                    'column_count' => '3',
                    'last_analyzed' => '2012-06-06 23:02:42.40264+00',
                    'disk_size' => '0 kB',
                  }
                ]
      )
    end

    it "fills in the 'description' attribute of each db object in the relation" do
      Dataset.refresh(account, schema)
      dataset.add_metadata!(account)

      dataset.statistics.description.should == "view1 is super cool"
      dataset.statistics.definition.should == 'SELECT * FROM users;'
      dataset.statistics.column_count.should == 3
      dataset.statistics.last_analyzed.to_s.should == "2012-06-06 23:02:42 UTC"
      dataset.statistics.disk_size == '0 kB'
    end
  end

  describe "search fields" do
    let(:dataset) {datasets(:bobsearch_table)}
    it "indexes text fields" do
      Dataset.should have_searchable_field :name
      Dataset.should have_searchable_field :database_name
      Dataset.should have_searchable_field :schema_name
      Dataset.should have_searchable_field :column_name
    end

    it "returns the schema name for schema_name" do
      dataset.schema_name.should == dataset.schema.name
    end

    it "returns the database name for database_name" do
      dataset.database_name.should == dataset.schema.database.name
    end

    it "returns the grouping_id " do
      dataset.grouping_id.should == "Dataset #{dataset.id}"
    end

    it "returns the type_name of target1" do
      dataset.type_name.should == 'Dataset'
    end
  end
end

describe Dataset::Query, :database_integration => true do
  let(:account) { real_gpdb_account }
  let(:schema) { GpdbSchema.find_by_name('test_schema') }

  before do
    refresh_chorus
  end

  subject do
    Dataset::Query.new(schema)
  end

  let(:rows) do
    schema.with_gpdb_connection(account) { |conn| conn.select_all(sql) }
  end

  describe "queries" do
    context "when table is not in 'public' schema" do
      let(:sql) { "SELECT * FROM base_table1" }

      it "works" do
        lambda { rows }.should_not raise_error
      end
    end

    context "when 'public' schema does not exist" do
      let(:schema) { GpdbSchema.find_by_name('non_public_schema') }
      let(:sql) { "SELECT * FROM base_table1" }

      it "works" do
        lambda { rows }.should_not raise_error
      end
    end
  end

  describe "#tables_and_views_in_schema" do
    let(:sql) { subject.tables_and_views_in_schema.to_sql }

    it "returns a query whose result includes the names of all tables and views in the schema," +
         "but does not include sub-partition tables, indexes, or relations in other schemas" do
      names = rows.map { |row| row["name"] }
      names.should =~ ["base_table1", "view1", "external_web_table1", "master_table1", "pg_all_types"]
    end

    it "includes the relations' types ('r' for table, 'v' for view)" do
      view_row = rows.find { |row| row['name'] == "view1" }
      view_row["type"].should == "v"

      rows.map { |row| row["type"] }.should =~ ["v", "r", "r", "r", "r"]
    end

    it "includes whether or not each relation is a master table" do
      master_row = rows.find { |row| row['name'] == "master_table1" }
      master_row["master_table"].should == "t"

      rows.map { |row| row["master_table"] }.should =~ ["t", "f", "f", "f", "f"]
    end
  end

  describe "#import", :database_integration => true do
    def call_sql(schema, account, sql_command)
      schema.with_gpdb_connection(account) do |connection|
        connection.exec_query(sql_command)
      end
    end

    context "with correct input" do
      let(:account) { real_gpdb_account }
      let(:user) { users(:carly)}
      let(:schema) { GpdbSchema.find_by_name('test_schema') }
      let(:src_table) { GpdbTable.find_by_name('base_table1') }
      let(:options) {
        {
            "to_table" => "the_new_table",
            "use_limit_rows" => "false",
            "sample_count" => 0
        }
      }

      before(:each) do
        refresh_chorus
        src_table.import(options, schema.instance.owner)
        GpdbTable.refresh(account, schema)
      end

      after(:each) do
        call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
      end

      it "creates the new table" do
        GpdbTable.find_by_name(options["to_table"]).should be_a(GpdbTable)
      end

      it "copies the constraints" do
        schema.with_gpdb_connection(account) do |connection|
          dest_constraints = connection.exec_query("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{options["to_table"]}'")
          src_constraints = connection.exec_query("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{src_table.name}'")

          dest_constraints.count.should == src_constraints.count
          dest_constraints.each_with_index do |constraint, i|
            constraint["constraint_type"].should == src_constraints[i]["constraint_type"]
            constraint["table_name"].should == options["to_table"]
          end
        end
      end

      it "copies the rows" do
        schema.with_gpdb_connection(account) do |connection|
          dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
          src_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{src_table.name}")

          dest_rows.count.should == src_rows.count
        end
      end

      context "when the rows are limited" do
        let(:options) {
          {
              "to_table" => "the_new_table",
              "use_limit_rows" => "true",
              "sample_count" => 5
          }
        }
        it "copies the rows up to limit" do
          schema.with_gpdb_connection(account) do |connection|
            dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
            dest_rows.count.should == 5
          end
        end

        context "when the row limit value is 0" do
          let(:options) {
            {
                "to_table" => "the_new_table",
                "use_limit_rows" => "true",
                "sample_count" => 0
            }
          }

          it "creates the table and copies 0 rows" do
            schema.with_gpdb_connection(account) do |connection|
              dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
              src_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{src_table.name}")
              dest_rows.count.should == 0
            end
          end
        end
      end
    end

    context "#import with exception", :database_integration => true do
      let(:account) { real_gpdb_account }
      let(:schema) { GpdbSchema.find_by_name('test_schema') }
      let(:src_table) { GpdbTable.find_by_name('base_table1') }
      let(:options) {
        {
            "to_table" => "the_new_table",
            "use_limit_rows" => "true",
            "sample_count" => -5
        }
      }

      before(:each) do
        refresh_chorus
      end

      after(:each) do
        call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
      end

      context "when the limit is -5" do
        it "raises an exception" do
          expect {
            src_table.import(options, schema.instance.owner)
          }.to raise_error(SqlCommandFailed)
          GpdbTable.refresh(account, schema)
        end
      end
    end
  end

  describe "#metadata_for_tables" do
    context "Base table" do
      let(:sql) { subject.metadata_for_dataset("base_table1").to_sql }

      it "returns a query whose result for a base table is correct" do
        row = rows.first

        row['name'].should == "base_table1"
        row['description'].should == "comment on base_table1"
        row['definition'].should be_nil
        row['column_count'].should == 5
        row['row_count'].should == 9
        row['table_type'].should == "BASE_TABLE"
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should =~ /kB/
        row['partition_count'].should == 0
      end
    end

    context "Master table" do
      let(:sql) { subject.metadata_for_dataset("master_table1").to_sql }

      it "returns a query whose result for a master table is correct" do
        row = rows.first

        row['name'].should == 'master_table1'
        row['description'].should == 'comment on master_table1'
        row['definition'].should be_nil
        row['column_count'].should == 2
        row['row_count'].should == 0 # will always be zero for a master table
        row['table_type'].should == 'MASTER_TABLE'
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should == '0 bytes' # will always be zero for a master table
        row['partition_count'].should == 7
      end
    end

    context "External table" do
      let(:sql) { subject.metadata_for_dataset("external_web_table1").to_sql }

      it "returns a query whose result for an external table is correct" do
        row = rows.first

        row['name'].should == 'external_web_table1'
        row['description'].should be_nil
        row['definition'].should be_nil
        row['column_count'].should == 5
        row['row_count'].should == 0 # will always be zero for an external table
        row['table_type'].should == 'EXT_TABLE'
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should == '0 bytes' # will always be zero for an external table
        row['partition_count'].should == 0
      end
    end

    context "View" do
      let(:sql) { subject.metadata_for_dataset("view1").to_sql }

      it "returns a query whose result for a view is correct" do
        row = rows.first
        row['name'].should == 'view1'
        row['description'].should == "comment on view1"
        row['definition'].should == "SELECT base_table1.id, base_table1.column1, base_table1.column2, base_table1.category, base_table1.time_value FROM base_table1;"
        row['column_count'].should == 5
        row['row_count'].should == 0
        row['disk_size'].should == '0 bytes'
        row['partition_count'].should == 0
      end
    end
  end
end
