require 'spec_helper'

describe CancelableQuery, :database_integration => true do
  let(:sql) { "Select * from users" }
  let(:check_id) { '0.1234' }
  let(:async_query) { CancelableQuery.new(connection, check_id) }
  let(:connection) { Object.new }
  let(:fake_driver) { Object.new }

  before :each do
    stub(async_query).driver { fake_driver }
  end

  describe ".execute" do
    it "adds a comment with the check_id to the start of the query" do
      mock(fake_driver).exec_sql_query("/*#{check_id}*/#{sql}")
      async_query.execute(sql)
    end

    it "raises QueryError if the query is canceled" do
      mock(fake_driver).exec_sql_query("/*#{check_id}*/#{sql}") { raise "error!" }

      expect{ async_query.execute(sql) }.to raise_error(CancelableQuery::QueryError)
    end

    it "returns the query result" do
      mock(fake_driver).exec_sql_query("/*#{check_id}*/#{sql}") { {:foo => "bar" } }
      async_query.execute(sql).should == { :foo => "bar" }
    end
  end

  describe "#cancel" do
    let!(:account) { refresh_chorus }
    let(:instance) { account.instance }
    let(:database) { GpdbDatabase.find_by_name!(GpdbIntegration.database_name) }
    let(:check_id) { '54321' }

    it "cancels the query" do
      sleep_thread = Thread.new(database, account, check_id) do |database, account, check_id|
        database.with_gpdb_connection(account) do |conn|
          expect {
            CancelableQuery.new(conn, check_id).execute("select pg_sleep(15)")
          }.to raise_error(CancelableQuery::QueryError)
        end
      end

      sleep 0.5

      database.with_gpdb_connection(account) do |conn|
        rows_before = get_rows_by_check_id(conn)
        CancelableQuery.new(conn, check_id).cancel

        sleep 0.5

        rows_after = get_rows_by_check_id(conn)

        rows_before.should be_present
        rows_after.should be_nil
      end

      sleep_thread.join
    end

    def get_rows_by_check_id(conn)
      query = "select current_query from pg_stat_activity;"
      conn.select_all(query).find { |row| row["current_query"].include? check_id }
    end
  end
end
