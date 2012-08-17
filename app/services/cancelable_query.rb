class CancelableQuery
  QueryError = Class.new(StandardError)

  def initialize(connection, check_id)
    @check_id = check_id
    @connection = connection
  end

  def execute(sql, options = {})
    begin
      @results = SqlResult.new

      statement = driver.prepare_statement("/*#{@check_id}*/#{sql}")
      if options[:limit]
        driver.set_auto_commit(false)
        statement.set_fetch_size(options[:limit])
        statement.set_max_rows(options[:limit])
      end
      statement.execute
      capture_warnings(statement)
      result_set = statement.get_result_set
      while(statement.more_results(statement.class::KEEP_CURRENT_RESULT) || statement.update_count != -1)
        result_set.close if result_set
        result_set = statement.get_result_set
      end
      populate_results(result_set)

      @results

    rescue Exception => e
      raise QueryError, "The query could not be completed. Error: #{e.message}"
    end
  end

  def cancel
    @connection.exec_query("select pg_cancel_backend(procpid) from pg_stat_activity where current_query LIKE '/*#{@check_id}*/%'")
  end

  def driver
    @driver ||= @connection.instance_variable_get(:"@connection").connection
  end

  private

  def populate_results(result_set)
    return unless result_set

    meta_data = result_set.meta_data

    (1..meta_data.column_count).each do |i|
      @results.add_column(meta_data.get_column_name(i), meta_data.column_type_name(i))
    end

    while result_set.next
      row = (1..meta_data.column_count).map do |i|
        result_set.get_string(i).to_s
      end
      @results.add_row(row)
    end
  end

  def capture_warnings(statement)
    warning = statement.get_warnings
    while(warning)
      @results.warnings << warning.to_s
      warning = warning.next_warning
    end
  end
end
