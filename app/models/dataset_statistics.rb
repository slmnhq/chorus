class DatasetStatistics
  attr_reader :description, :definition, :row_count, :column_count, :table_type,
              :last_analyzed, :disk_size, :partition_count

  def parse_analyzed_date(date)
    Time.parse(date).utc if date
  end

  def initialize(row)
    @definition   = row["definition"]
    @description  = row["description"]
    @column_count = row["column_count"].to_i
    @row_count = row["row_count"].to_i
    @table_type = row["table_type"]
    @last_analyzed = parse_analyzed_date(row["last_analyzed"])
    @disk_size = row["disk_size"]
    @partition_count = row["partition_count"].to_i
  end
end
