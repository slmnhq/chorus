require "spec_helper"

describe GpdbDatabaseObject::Query, :type => :database_integration do
  let(:account) { real_gpdb_account }

  attr_reader :schema

  before do
    GpdbDatabase.refresh(account)
    database = GpdbDatabase.find_by_name('gpdb_test_database')
    GpdbSchema.refresh(account, database)
    @schema = GpdbSchema.find_by_name('gpdb_test_schema')
  end

  subject do
    GpdbDatabaseObject::Query.new(schema)
  end

  let(:rows) do
    schema.with_gpdb_connection(account) { |conn| conn.select_all(sql) }
  end

  describe "#tables_and_views_in_schema" do
    let(:sql) { subject.tables_and_views_in_schema.to_sql }

    it "returns a query whose result includes the names of all tables and views in the schema," +
       "but does not include sub-partition tables, indices, or relations in other schemas" do
      names = rows.map { |row| row["name"] }
      names.should =~ [ "base_table1", "view1", "external_web_table1", "master_table1" ]
    end

    it "includes the relations' types ('r' for table, 'v' for view)" do
      view_row = rows.find { |row| row['name'] == "view1" }
      view_row["type"].should == "v"

      rows.map { |row| row["type"] }.should =~ [ "v", "r", "r", "r" ]
    end

    it "includes whether or not each relation is a master table" do
      master_row = rows.find { |row| row['name'] == "master_table1" }
      master_row["master_table"].should == "t"

      rows.map { |row| row["master_table"] }.should =~ [ "t", "f", "f", "f" ]
    end
  end

  describe "#comments_for_tables" do
    let(:sql) { subject.comments_for_tables(["base_table1", "view1", "external_web_table1"]).to_sql }

    it "returns a query whose result includes each table/view's name and comment" +
       "and excludes tables that have no comment" do
      rows.should =~ [
        { "object_name" => "base_table1", "comment" => "comment on base_table1" },
        { "object_name" => "view1", "comment" => "comment on view1" }
      ]
    end
  end
end
