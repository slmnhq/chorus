require 'spec_helper'

describe CancelableQuery do
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
      mock(fake_driver).exec_sql_query("/*#{check_id}*/#{sql}") {
        raise "error!"
      }

      expect{async_query.execute(sql)}.to raise_error(CancelableQuery::QueryError)
    end

    it "returns the query result" do
      mock(fake_driver).exec_sql_query("/*#{check_id}*/#{sql}") { {:foo => "bar"}}
      async_query.execute(sql).should == {:foo => "bar" }
    end
  end

  describe ".cancel" do
    it "should cancel the task" do
      mock(connection).exec_query("SELECT pg_cancel_backend(activity.procpid) from (select procpid from pg_stat_activity where current_query LIKE '/*#{check_id}*/') AS activity")
      async_query.cancel
    end
  end
end