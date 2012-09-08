require 'dataset'

class ChorusView < Dataset
  validate :validate_query

  def validate_query
    return unless changes.include?(:query)
    raise ActiveRecord::StatementInvalid unless query.upcase.start_with?("SELECT", "WITH")
    account = account_for_user!(schema.database.gpdb_instance.owner)
    resultSet = []
    schema.with_gpdb_connection(account, true) do |conn|
      resultSet = conn.exec_query("EXPLAIN #{query}")
    end
    if (resultSet[0].class != Hash)  #This means there is more than one sql statement
      errors.add(:query, :too_many_statements)
    end
  end

  def column_name
  end
end