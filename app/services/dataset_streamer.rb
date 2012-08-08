require 'csv'
class DatasetStreamer
  attr_accessor :dataset, :user, :format, :row_limit
  def initialize(dataset, user, row_limit = nil)
    self.dataset = dataset
    self.user = user
    self.row_limit = row_limit
  end

  def format(hash, first_row)
    results = '';
    results << hash.keys.to_csv if first_row
    results << hash.values.to_csv
    results
  end

  def enum
    first_row = true
    account = dataset.instance.account_for_user(user)
    Enumerator.new do |y|
      dataset.schema.with_gpdb_connection(account) do |conn|
        ActiveRecord::Base.each_row_by_sql(dataset.all_rows_sql(row_limit), connection: conn) do |row|
          y << format(row, first_row)
          first_row = false
        end
      end
    end
  end
end