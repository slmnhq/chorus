class SqlResults
  PREVIEW_SQL = "SELECT * FROM %s LIMIT 100"

  def self.preview_dataset(dataset, account, check_id)
    dataset.with_gpdb_connection(account) do |conn|
      sql = PREVIEW_SQL % conn.quote_table_name(dataset.name)
      async_query = AsyncQuery.new(conn, check_id)

      from_sql(conn, async_query, sql)
    end
  end

  # TODO: How do we test this?
  def self.cancel_preview(dataset, account, check_id)
    dataset.with_gpdb_connection(account) do |conn|
      async_query = AsyncQuery.new(conn, check_id)
      async_query.cancel
    end
  end

  def self.from_sql(connection, async_query, sql)
    pg_results = async_query.execute(sql)
    meta_data = pg_results.getMetaData()
    columns = Array.new(meta_data.getColumnCount()) do |i|
      {
        :name => meta_data.getColumnName(i+1),
        :data_type => meta_data.getColumnTypeName(i+1)
      }
    end

    rows = []
    while pg_results.next
      row = []
      (1..meta_data.column_count).each do |i|
        row << pg_results.get_string(i).to_s
      end
      rows << row
    end

    new(columns, rows)
  end

  def initialize(columns, rows)
    @columns = columns.map do |column_attrs|
      GpdbColumn.new(column_attrs)
    end

    @rows = rows
  end

  attr_reader :columns, :rows
end
