require 'dataset'

class ChorusView < Dataset
  validate :validate_query

  def validate_query
    return unless changes.include?(:query)
    unless query.upcase.start_with?("SELECT", "WITH")
      errors.add(:query, :start_with_keywords)
    end

    account = account_for_user!(schema.database.gpdb_instance.owner)
    schema.with_gpdb_connection(account, true) do |connection|
      jdbc_conn = connection.instance_variable_get(:"@connection").connection
      s = jdbc_conn.prepareStatement(query)
      begin
        flag = org.postgresql.core::QueryExecutor::QUERY_DESCRIBE_ONLY
        s.executeWithFlags(flag)
      rescue => e
        errors.add(:query, :generic, {:message => "Cannot execute SQL query. #{e.cause}"})
      end
      if s.getMoreResults
        errors.add(:query, :multiple_result_sets)
      end
    end
  end

  def preview_sql
    query
  end

  def column_name
  end

  def workspace
    bound_workspaces.first
  end

  def all_rows_sql(limit = nil)
    sql = "SELECT * FROM (#{query.gsub(';', '');}) AS cv_query"
    sql += " LIMIT #{limit}" if limit
    sql
  end
end