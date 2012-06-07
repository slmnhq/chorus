class SqlResults
  PREVIEW_SQL = "SELECT * FROM %s LIMIT 100"

  def self.preview_database_object(database_object, account)
    database_object.with_gpdb_connection(account) do |conn|
      sql = PREVIEW_SQL % conn.quote_table_name(database_object.name)
      from_sql(sql, conn)
    end
  end

  def self.from_sql(sql, connection)
    # Execute the sql here, because the connection will
    # be closed immediately after this method returns
    pg_results = connection.execute(sql)
    columns = Array.new(pg_results.nfields) do |i|
      data_type = connection.query("select format_type(#{pg_results.ftype(i)}, #{pg_results.fmod(i)})")[0][0]
      {
        :name => pg_results.fname(i),
        :data_type => data_type
      }
    end

    rows = pg_results.values
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
