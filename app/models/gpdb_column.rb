class GpdbColumn
  COLUMN_METADATA_QUERY = <<-SQL
    SELECT a.attname, format_type(a.atttypid, a.atttypmod), des.description, a.attnum,
           s.null_frac, s.n_distinct, s.most_common_vals, s.most_common_freqs, s.histogram_bounds,
           c.reltuples
      FROM pg_attribute a
      LEFT JOIN pg_description des
        ON a.attrelid = des.objoid AND a.attnum = des.objsubid
      LEFT JOIN pg_namespace n
        ON n.nspname = %s
      LEFT JOIN pg_class c
        ON c.relnamespace = n.oid
       AND c.relname = %s
      LEFT JOIN pg_stats s
        ON s.attname = a.attname
       AND s.schemaname = n.nspname
       AND s.tablename = c.relname
      WHERE a.attrelid = %s::regclass
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY a.attnum;
  SQL

  attr_accessor :data_type, :description, :ordinal_position, :statistics, :name, :statistics

  def self.columns_for(account, dataset)
    case dataset.type
      when 'ChorusView'
        self.columns_for_chorusview(account, dataset)
      else
        self.columns_for_table(account, dataset)
    end
  end

  def self.columns_for_chorusview(account, view)
    columns_with_stats = view.with_gpdb_connection(account) do |conn|
      query = view.query
      if (query =~ /limit *\d *[;] *$/i) == nil
        query += " LIMIT 1"
      end

      conn.exec_query("CREATE TEMP TABLE tmp_tbl AS #{query}")

      table = GpdbTable.new
      table.name = "tmp_tbl"
      table.schema = view.schema

      result = self.columns_for_table(account, table, conn)

      conn.exec_query("DROP TABLE IF EXISTS tmp_tbl")
      result
    end
  end

  def self.columns_for_table(account, table, connection = nil)
    if connection
      columns_with_stats = connection.exec_query(COLUMN_METADATA_QUERY % [connection.quote(table.schema.name), connection.quote(table.name), connection.quote(connection.quote_column_name(table.name))])
    else
      columns_with_stats = table.with_gpdb_connection(account) do |conn|
        conn.exec_query(COLUMN_METADATA_QUERY % [conn.quote(table.schema.name), conn.quote(table.name), conn.quote(conn.quote_column_name(table.name))])
      end
    end

    columns_with_stats.map.with_index do |raw_row_data, i|
      column = GpdbColumn.new({
        :name => raw_row_data["attname"],
        :data_type => raw_row_data["format_type"],
        :description => raw_row_data["description"],
        :ordinal_position => i + 1
      })
      params = []
      params << raw_row_data["null_frac"]
      params << raw_row_data["n_distinct"]
      params << raw_row_data["most_common_vals"]
      params << raw_row_data["most_common_freqs"]
      params << raw_row_data["histogram_bounds"]
      params << raw_row_data["reltuples"]
      params << column.number_or_time?
      column.statistics = GpdbColumnStatistics.new(*params)
      column
    end
  end

  def initialize(attributes={})
    @name = attributes[:name]
    @data_type = attributes[:data_type]
    @description = attributes[:description]
    @ordinal_position = attributes[:ordinal_position]
  end

  def simplified_type
    @simplified_type ||= ActiveRecord::ConnectionAdapters::PostgreSQLColumn.new(name, nil, data_type, nil).type
  end

  def number_or_time?
    [:decimal, :integer, :float, :date, :time, :datetime].include? simplified_type
  end
end
