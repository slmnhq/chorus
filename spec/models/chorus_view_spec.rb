require "spec_helper"

describe ChorusView do
  describe "#validate_query", :database_integration => true do
    let(:database) { GpdbIntegration.real_database }
    let(:schema) { database.schemas.find_by_name('public') }
    let(:account) { GpdbIntegration.real_gpdb_account }

    it "can be valid" do
      chorus_view = ChorusView.new({:name => "query", :schema => schema, :query => "selecT 1;"}, :without_protection => true)
      chorus_view.should be_valid
      chorus_view.query.should == "selecT 1;"
    end

    it "should return only one result set" do
      described_class.new(
          {
              :name => 'multiple result sets',
              :schema => schema,
              :query => "select 1; select 2;"
          },
          :without_protection => true).should_not be_valid
    end

    it 'does not execute the query' do
      schema.with_gpdb_connection(account) do |conn|
        conn.exec_query("drop table if exists bad_chorus_view_table;")
      end

      chorus_view = described_class.new(
          {
              :name => 'multiple result sets',
              :schema => schema,
              :query => "select 1; drop table if exists bad_chorus_view_table; create table bad_chorus_view_table();"
          },
          :without_protection => true)
      chorus_view.validate_query
      schema.with_gpdb_connection(account) do |conn|
        expect {
          conn.exec_query("select * from bad_chorus_view_table")
        }.to raise_error(ActiveRecord::StatementInvalid)
      end
    end

    it "returns the cause" do
      chorus_view = described_class.new(
          {
              :name => 'multiple result sets',
              :schema => schema,
              :query => "select potato"
          },
          :without_protection => true)
      chorus_view.validate_query
      chorus_view.errors[:query][0][1][:message].should_not =~ /postgres/
    end

    it "should be invalid if it references a nonexistent table" do
      described_class.new({:name => "invalid_query",
                           :schema => schema,
                           :query => "select * from nonexistent_table;"},
                          :without_protection => true).should_not be_valid
    end

    it "should start with select or with" do
      chorus_view = described_class.new({:name => "invalid_query",
                                         :schema => schema,
                                         :query => "create table query_not_starting_with_keyword_table();"},
                                        :without_protection => true)
      chorus_view.should_not be_valid
      chorus_view.errors[:query][0][0].should == :start_with_keywords

    end
  end

  describe "#preview_sql" do
    let(:chorus_view) do
      ChorusView.new({:name => "query",
                      :schema => gpdb_schemas(:default),
                      :query => "select 1"},
                     :without_protection => true)
    end

    it "returns the query" do
      chorus_view.preview_sql.should == "select 1"
    end
  end

  describe "#all_row_sql" do
    let(:chorus_view) do
      ChorusView.new({:name => "query",
                      :schema => gpdb_schemas(:default),
                      :query => "select 1"},
                     :without_protection => true)
    end

    it "returns the correct sql" do
      chorus_view.all_rows_sql().strip.should == %Q{SELECT * FROM (select 1) AS cv_query}
    end

    it "returns the sql without semicolon" do
      chorus_view.query = "select 2;"
      chorus_view.all_rows_sql().strip.should == %Q{SELECT * FROM (select 2) AS cv_query}
    end

    context "with a limit" do
      it "uses the limit" do
        chorus_view.all_rows_sql(10).should match "LIMIT 10"
      end
    end
  end
end
