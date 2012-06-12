require 'spec_helper'

describe AsyncQuery do
  let(:sql) { "Select * from users" }
  let(:async_query) { AsyncQuery.new(connection, "0.1234") }
  let(:connection) do
    Object.new.tap do |connection|
      mock(connection).instance_variable_get(:"@connection") { @driver_mock }
    end
  end

  before do
    @driver_mock = Object.new
  end

  describe ".start_query" do
    before do
      stub(@driver_mock).backend_pid { 123 }
      mock(@driver_mock).setnonblocking(false)
      mock(@driver_mock).setnonblocking(true)
      mock(@driver_mock).send_query(sql)
    end

    it "it creates an async query task in the database" do
      async_query.start_query(sql)

      task = AsyncQueryTask.first
      task.process_id.should == 123
      task.check_id.should == "0.1234"
    end
  end

  describe "#results" do
    before do
      stub(@driver_mock).backend_pid { 123 }
      mock(@driver_mock).setnonblocking(false)
      mock(@driver_mock).setnonblocking(true)
      mock(@driver_mock).send_query(sql)
      mock(@driver_mock).get_result { pg_result }

      async_query.start_query(sql)
    end

    context "when there's no error from PG driver'" do
      let(:pg_result) do
        Object.new.tap do |result|
          stub(result).result_status { PG::PGRES_TUPLES_OK }
          stub(result).values { [123] }
        end
      end

      it "destroys previous created async query task object" do
        expect { async_query.results }.to change(AsyncQueryTask, :count).to(0)
      end

      it "returns the query result" do
        async_query.results.should == pg_result
      end
    end

    context "when PG driver returns a failure" do
      let(:pg_result) do
        Object.new.tap do |result|
          stub(result).result_status { PG::PGRES_FATAL_ERROR }
          stub(result).error_message { "Fatal error" }
        end
      end

      it "destroys previous created async query task object" do
        expect do
          begin
            async_query.results
          rescue AsyncQuery::QueryError
          end
        end.to change(AsyncQueryTask, :count).to(0)
      end

      it "raises an exception" do
        expect do
          async_query.results
        end.to raise_error(AsyncQuery::QueryError, "PG driver did not respond with success. Error: Fatal error")
      end
    end
  end

  describe ".cancel" do
    before do
      AsyncQueryTask.create({:check_id => '0.1234', :process_id => '123'})
    end

    it "should cancel the task" do
      mock(@driver_mock).exec("SELECT pg_cancel_backend(123)")
      async_query.cancel
    end
  end
end