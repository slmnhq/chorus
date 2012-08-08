module SqlExecutor
  class << self
    def preview_dataset(dataset, account, check_id)
      execute_sql(dataset.schema, account, check_id, dataset.preview_sql)
    end

    def execute_sql(schema, account, check_id, sql)
      schema.with_gpdb_connection(account) do |conn|
        cancelable_query = CancelableQuery.new(conn, check_id)
        build_result(cancelable_query.execute(sql))
      end
    end

    def cancel_query(gpdb_connection_provider, account, check_id)
      gpdb_connection_provider.with_gpdb_connection(account) do |conn|
        cancelable_query = CancelableQuery.new(conn, check_id)
        cancelable_query.cancel
      end
    end

    private

    def build_result(pg_results)
      meta_data = pg_results.meta_data
      result = SqlResult.new

      (1..meta_data.column_count).each do |i|
        result.add_column(meta_data.get_column_name(i), meta_data.column_type_name(i))
      end

      while pg_results.next
        row = (1..meta_data.column_count).map do |i|
          pg_results.get_string(i).to_s
        end
        result.add_row(row)
      end

      result
    end
  end
end

