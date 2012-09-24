require 'spec_helper'

describe MultipleResultsetQuery do
  let(:connection) { ActiveRecord::Base.connection }
  let(:sql) { "Select 1 as a" }
  let(:check_id) { '0.1234' }
  let(:query) { described_class.new(connection) }
  let(:driver) { query.driver }

  describe ".execute" do
    it "raises QueryError if an error occurs" do
      mock.proxy(driver).prepare_statement(sql) do |statement|
        mock(statement).execute { raise "error!" }
      end

      expect { query.execute(sql) }.to raise_error(MultipleResultsetQuery::QueryError)
    end

    it "returns the query result" do
      result = query.execute(sql)
      result.rows[0][0].should == '1'
    end

    it "returns the last set of results when there are multiple" do
      result = query.execute("select 1 as a; select 2 as b;")
      result.rows[0][0].should == '2'
    end

    it "limits the result rows if given a limit" do
      result = query.execute("select 1 as a limit 10; select * from users limit 1000;", :limit => 2)
      result.rows.length.should == 2
    end

    it "returns empty SqlResults when there is no query" do
      result = query.execute("")
      result.rows.should be_empty
    end

    it "surfaces all warnings" do
      result = query.execute("create table surface_warnings (id INT PRIMARY KEY); drop table surface_warnings; create table surface_warnings (id INT PRIMARY KEY); drop table surface_warnings")
      result.warnings.length.should == 2
      result.warnings.each do |warning|
        warning.should match /will create implicit index/
      end
    end

    it "returns the last set even when non selects statements are in the way" do
      result = query.execute("create table surface_warnings (id INT); drop table surface_warnings; select 1;")
      result.rows[0][0].should == '1'
    end

    it "sets fetch size on the statement" do
      mock.proxy(driver).prepare_statement(sql) do |statement|
        mock(statement).set_fetch_size(40)
      end

      query.execute(sql, :limit => 40)
    end

    it "actually commits data changes when a limit is specified" do
      mock.proxy(driver).commit
      query.execute("select 1;", :limit => 40)
    end

    it "actually does not try to commit when no limit is specified (as autocommit is enabled)" do
      dont_allow(driver).commit
      query.execute("select 1;")
    end

    describe "logging" do
      it "logs sql sent to the exec_query method of the connection" do
        log = ''
        stub(Rails.logger).debug {|message| log = message}
        query.execute("SELECT * FROM users")
        log.should include "SELECT * FROM users"
      end
    end
  end
end