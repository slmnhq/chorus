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
      Dataset.with_name_like(nil).count.should == 1
    end
  end

  context ".refresh" do
    before(:each) do
      stub_gpdb(account, datasets_sql => [
        {'type' => "r", "name" => "table1", "master_table" => 't'},
        {'type' => "v", "name" => "view1", "master_table" => 'f'}
      ])
    end

    it "creates new copies of the db objects in our db" do
      Dataset.refresh(account, schema)

      datasets = schema.datasets.order(:name)
      datasets.size.should == 2
      datasets.map(&:class).should == [GpdbTable, GpdbView]
      datasets.pluck(:name).should == ["table1", "view1"]
      datasets.pluck(:master_table).should == [true, false]
    end

    it "does not re-create db objects that already exist in our database" do
      Dataset.refresh(account, schema)
      Dataset.refresh(account, schema)

      Dataset.count.should == 2
    end

    it "destroy db objects that no longer exist in gpdb" do
      Dataset.refresh(account, schema)

      stub_gpdb(account, datasets_sql => [
        {'type' => "r", "name" => "table1"}
      ])

      Dataset.refresh(account, schema)
      datasets = Dataset.all

      datasets.length.should == 1
      datasets.map(&:name).should == ["table1"]
    end

    it "does not destroy db objects on other schemas" do
      other_schema = FactoryGirl.create(:gpdb_schema)
      to_be_kept = FactoryGirl.create(:gpdb_table, :schema => other_schema, :name => "matching")
      to_be_deleted = FactoryGirl.create(:gpdb_table, :schema => schema, :name => "matching")

      stub_gpdb(account, datasets_sql => [
        {'type' => "r", 'name' => "new"}
      ])
      Dataset.refresh(account, schema)

      other_schema.reload.datasets.count.should == 1
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
end

describe Dataset::Query, :database_integration => true do
  let(:account) { real_gpdb_account }
  let(:schema) { GpdbSchema.find_by_name('gpdb_test_schema') }

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
      let(:schema) { GpdbSchema.find_by_name('gpdb_test_schema_in_db_without_public_schema') }
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
