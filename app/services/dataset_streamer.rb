require 'csv'
class DatasetStreamer
  attr_accessor :dataset, :user, :format, :row_limit
  def initialize(dataset, user, row_limit = nil)
    self.dataset = dataset
    self.user = user
    self.row_limit = row_limit
  end

  def format(hash, row_number)
    results = ''
    results << hash.keys.to_csv if row_number == 1
    results << hash.values.to_csv
    results
  end

  def enum
    row_number = 0
    account = dataset.instance.account_for_user!(user)

    Enumerator.new do |y|
      begin
        dataset.schema.with_gpdb_connection(account) do |conn|
          ActiveRecord::Base.each_row_by_sql(dataset.all_rows_sql(row_limit), :connection => conn) do |row|
            row_number += 1
            y << format(row, row_number)
          end

          if (row_number == 0)
            y << "The requested dataset contains no rows"
          end
        end
      rescue Exception => e
        y << e.message
      end

      ActiveRecord::Base.connection.close
    end
  end
end