class CancelableQuery < MultipleResultsetQuery

  def initialize(connection, check_id)
    super(connection)
    @check_id = check_id
  end

  def execute(sql, options = {})
    super("/*#{@check_id}*/#{sql}", options)
  end

  def cancel
    @connection.exec_query("select pg_cancel_backend(procpid) from pg_stat_activity where current_query LIKE '/*#{@check_id}*/%'")
  end
end
