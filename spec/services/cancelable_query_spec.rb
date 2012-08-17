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

      expect { cancelable_query.execute(sql) }.to raise_error(CancelableQuery::QueryError)
    end

    it "returns the query result" do
      result = cancelable_query.execute(sql)
      result.rows[0][0].should == '1'
    end

    it "returns the last set of results when there are multiple" do
      result = cancelable_query.execute("select 1 as a; select 2 as b;")
      result.rows[0][0].should == '2'
    end

    it "limits the result rows if given a limit" do
      result = cancelable_query.execute("select 1 as a limit 10; select * from users limit 1000;", :limit => 2)
      result.rows.length.should == 2
    end

    it "returns empty SqlResults when there is no query" do
      result = cancelable_query.execute("")
      result.rows.should be_empty
    end

    it "surfaces all warnings" do
      result = cancelable_query.execute("create table surface_warnings (id INT PRIMARY KEY); drop table surface_warnings; create table surface_warnings (id INT PRIMARY KEY); drop table surface_warnings")
      result.warnings.length.should == 2
      result.warnings.each do |warning|
        warning.should match /will create implicit index/
      end
    end

    it "returns the last set even when non selects statements are in the way" do
      result = cancelable_query.execute("create table surface_warnings (id INT); drop table surface_warnings; select 1;")
      result.rows[0][0].should == '1'
    end

    it "sets fetch size on the statement" do
      mock.proxy(driver).prepare_statement("/*#{check_id}*/#{sql}") do |statement|
        mock(statement).set_fetch_size(40)
      end

      cancelable_query.execute(sql, :limit => 40)
    end
  end

  describe "#cancel" do
    let(:check_id) { '54321' }

    it "cancels the query" do
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
