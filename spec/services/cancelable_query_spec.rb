require 'spec_helper'

describe CancelableQuery do
  let(:connection) { ActiveRecord::Base.connection }
  let(:sql) { "Select 1 as a" }
  let(:check_id) { '0.1234' }
  let(:cancelable_query) { CancelableQuery.new(connection, check_id) }
  let(:driver) { cancelable_query.driver }

  describe ".execute" do
    it "adds a comment with the check_id to the start of the query" do
      mock.proxy(driver).prepare_statement("/*#{check_id}*/#{sql}")
      cancelable_query.execute(sql)
    end

    it "raises QueryError if an error occurs" do
      mock.proxy(driver).prepare_statement("/*#{check_id}*/#{sql}") do |statement|
        mock(statement).execute { raise "error!" }
      end

      expect { cancelable_query.execute(sql) }.to raise_error(MultipleResultsetQuery::QueryError)
    end

    it "returns the query result" do
      result = cancelable_query.execute(sql)
      result.rows[0][0].should == '1'
    end

    it "returns the last set of results when there are multiple" do
      result = cancelable_query.execute("select 1 as a; select 2 as b;")
      result.rows[0][0].should == '2'
    end
  end

  describe "#cancel" do
    let(:check_id) { '54321' }

    it "cancels the query" do
      pending "'pg_stat_activity' table doesn't have a 'current_query' column on PostgreSQL 9.2"
      sleep_thread = Thread.new(check_id) do |check_id|
        begin
          conn = ActiveRecord::Base.connection
          expect {
            CancelableQuery.new(conn, check_id).execute("select pg_sleep(15)")
          }.to raise_error(CancelableQuery::QueryError)
        ensure
          conn.close
        end
      end

      sleep 0.5

      begin
        #can't use ActiveRecord::Base.connection because pg_cancel_backend respects the transaction barrier.
        pool= ActiveRecord::Base.connection_handler.retrieve_connection_pool(ActiveRecord::Base)
        conn = pool.checkout
        rows_before = get_rows_by_check_id(conn)
        CancelableQuery.new(conn, check_id).cancel

        sleep 0.5

        rows_after = get_rows_by_check_id(conn)

        rows_before.should be_present
        rows_after.should be_nil
      ensure
        pool.checkin(conn)
      end

      sleep_thread.join
    end

    def get_rows_by_check_id(conn)
      query = "select current_query from pg_stat_activity;"
      conn.select_all(query).find { |row| row["current_query"].include? check_id }
    end
  end
end
