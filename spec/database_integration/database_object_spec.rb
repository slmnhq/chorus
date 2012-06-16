require "spec_helper"

describe Dataset::Query, :type => :database_integration do
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
    let(:sql) { "SELECT * FROM base_table1" }

    it "work, even when table is not in 'public' schema" do
      lambda { rows }.should_not raise_error
    end
  end

  describe "#tables_and_views_in_schema" do
    let(:sql) { subject.tables_and_views_in_schema.to_sql }

    it "returns a query whose result includes the names of all tables and views in the schema," +
       "but does not include sub-partition tables, indexes, or relations in other schemas" do
      names = rows.map { |row| row["name"] }
      names.should =~ [ "base_table1", "view1", "external_web_table1", "master_table1", "pg_all_types" ]
    end

    it "includes the relations' types ('r' for table, 'v' for view)" do
      view_row = rows.find { |row| row['name'] == "view1" }
      view_row["type"].should == "v"

      rows.map { |row| row["type"] }.should =~ [ "v", "r", "r", "r", "r" ]
    end

    it "includes whether or not each relation is a master table" do
      master_row = rows.find { |row| row['name'] == "master_table1" }
      master_row["master_table"].should == "t"

      rows.map { |row| row["master_table"] }.should =~ [ "t", "f", "f", "f", "f" ]
    end
  end

  describe "#metadata_for_tables" do

    context "Base table" do
      let(:sql) { subject.metadata_for_database_object("base_table1").to_sql }
  
      it "returns a query whose result for a base table is correct" do
        row = rows.first
  
        row['name'].should == "base_table1"
        row['description'].should == "comment on base_table1"
        row['definition'].should be_nil
        row['column_count'].should == "3"
        row['row_count'].should == "5"
        row['table_type'].should == "BASE_TABLE"
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should =~ /kB/
        row['partition_count'].should == "0"
      end
    end

    context "Master table" do
      let(:sql) { subject.metadata_for_database_object("master_table1").to_sql }

      it "returns a query whose result for a master table is correct" do
        row = rows.first

        row['name'].should == 'master_table1'
        row['description'].should == 'comment on master_table1'
        row['definition'].should be_nil
        row['column_count'].should == '2'
        row['row_count'].should == '0' # will always be zero for a master table
        row['table_type'].should == 'MASTER_TABLE'
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should == '0 bytes' # will always be zero for a master table
        row['partition_count'].should == '7'
      end
    end

    context "External table" do
      let(:sql) { subject.metadata_for_database_object("external_web_table1").to_sql }

      it "returns a query whose result for an external table is correct" do
        row = rows.first

        row['name'].should == 'external_web_table1'
        row['description'].should be_nil
        row['definition'].should be_nil
        row['column_count'].should == '5'
        row['row_count'].should == '0' # will always be zero for an external table
        row['table_type'].should == 'EXT_TABLE'
        row['last_analyzed'].should_not be_nil
        row['disk_size'].should == '0 bytes' # will always be zero for an external table
        row['partition_count'].should == '0'
      end
    end

    context "View" do
      let(:sql) { subject.metadata_for_database_object("view1").to_sql }

      it "returns a query whose result for a view is correct" do
        row = rows.first
        row['name'].should == 'view1'
        row['description'].should == "comment on view1"
        row['definition'].should == "SELECT base_table1.id, base_table1.column1, base_table1.column2 FROM base_table1;"
        row['column_count'].should == '3'
        row['row_count'].should == '0'
        row['disk_size'].should == '0 bytes'
        row['partition_count'].should == '0'
      end
    end
  end
end
