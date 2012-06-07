class GpdbTable < GpdbDatabaseObject

  def analyzed_date(table_stats)
    analyzed_date = table_stats.fetch("last_analyzed", '')
    if analyzed_date.present?
      Time.parse(analyzed_date).utc
    end
  end

  def analyze(account)
    table_name = '"' + schema.name + '"."'  + name + '"';
    query_string = "analyze #{table_name}"
    schema.with_gpdb_connection(account) do |conn|
      conn.select_all(query_string)
    end
  end
end
