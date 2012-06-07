require "spec_helper"

describe GpdbDatabaseObject::Query, :type => :database_integration do
  let(:account) { real_gpdb_account }
  let(:schema) { GpdbSchema.find_by_name('gpdb_test_schema') }

  before do
    refresh_chorus
  end

  subject do
    GpdbDatabaseObject::Query.new(schema)
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
    let(:sql) { subject.metadata_for_tables(["base_table1", "view1", "external_web_table1"]).to_sql }

    it "returns a query whose result includes, for each of the given tables/views," +
       "the name, comment (if present) and sql definition (for views)" do
      rows.should =~ [
        {
          "name" => "base_table1",
          "description" => "comment on base_table1",
          "definition" => nil,
          "column_count" => "3"
        },
        {
          "name" => "view1",
          "description" => "comment on view1",
          "definition" => "SELECT base_table1.id, base_table1.column1, base_table1.column2 FROM base_table1;",
          "column_count" => "3"
        },
        {
          "name" => "external_web_table1",
          "description" => nil,
          "definition" => nil,
          "column_count" => "5"
        }
      ]
    end
  end
end
