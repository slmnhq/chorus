module GpdbTestHelpers
  def stub_gpdb(account, database_name=nil, query_values)
    fake_connection = Object.new
    query_values.each do |query, response|
      mock(fake_connection).query(query) { response }
    end
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account) {|_, _, block| block.call(fake_connection) }
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account, anything) {|_, _, _, block| block.call(fake_connection) }
  end

  def stub_gpdb_fail(account)
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account) { raise PG::Error }
    stub(Gpdb::ConnectionBuilder).connect!(account.instance, account, anything) { raise PG::Error }
  end
end
