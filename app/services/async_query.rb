class AsyncQuery
  QueryError = Class.new(StandardError)

  def initialize(connection, check_id)
    @check_id = check_id
    @driver = get_pg_driver(connection)
  end

  def start_query(sql)
    @driver.setnonblocking(true)
    @driver.send_query(sql)
    @async_query_task = AsyncQueryTask.create!({
      :process_id => @driver.backend_pid,
      :check_id => @check_id
    })
    @driver.setnonblocking(false)
  end

  def results
    result = @driver.get_result
    @async_query_task.destroy

    # Check http://deveiate.org/code/pg/PG/Result.html for error codes
    if result.result_status < PG::PGRES_BAD_RESPONSE
      # No errors
      result
    else
      raise QueryError, "PG driver did not respond with success. Error: #{result.error_message}"
    end
  end

  def cancel
    async_query_task = AsyncQueryTask.find_by_check_id!(@check_id)
    @driver.exec("SELECT pg_cancel_backend(#{async_query_task.process_id})")
  end

  private

  def get_pg_driver(connection)
    connection.instance_variable_get(:"@connection")
  end
end