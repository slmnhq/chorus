module GpdbTestHelpers
  def stub_gpdb(account, query_values)
    fake_connection = FakeConnection.new
    query_values.each do |query, response|
      stub(fake_connection).execute(query).times(any_times) { clone_response(response) }
      stub(fake_connection).exec_query(query).times(any_times) { clone_response(response) }
      stub(fake_connection).select_all(query).times(any_times) { clone_response(response) }
    end
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account) {|_, _, block| block.call(fake_connection) }
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account, anything) {|_, _, _, block| block.call(fake_connection) }
  end

  def stub_gpdb_fail(account)
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account) { raise ActiveRecord::JDBCError }
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account, anything) { raise ActiveRecord::JDBCError }
  end

  def clone_response(response)
    response.map(&:clone)
  end

  class FakeConnection
    def transaction
      yield
    end

    def quote_column_name(val)
      val
    end

    def schema_search_path=(path)
    end
  end
end
