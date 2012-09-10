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
        errors.add(:query, :generic, {:message => e.message})
      end
      if s.getMoreResults
        errors.add(:query, :multiple_result_sets)
      end
    end
  end

  def column_name
  end
end