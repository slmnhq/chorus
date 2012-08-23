class ChorusView < Dataset
  validate :validate_query

  def validate_query
    raise ActiveRecord::StatementInvalid unless query.upcase.start_with?("SELECT", "WITH")
    account = account_for_user!(schema.database.instance.owner)
    schema.with_gpdb_connection(account, false) do |conn|
      conn.exec_query("EXPLAIN #{query}")
    end
  end

  def column_name
  end
end