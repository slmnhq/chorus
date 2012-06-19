class GpdbColumn
  COLUMN_METADATA_QUERY = <<-SQL
    SELECT a.attname, format_type(a.atttypid, a.atttypmod), des.description, a.attnum,
           s.null_frac, s.n_distinct, s.most_common_vals, s.most_common_freqs, s.histogram_bounds,
           c.reltuples
      FROM pg_attribute a
      LEFT JOIN pg_description des
        ON a.attrelid = des.objoid AND a.attnum = des.objsubid
      LEFT JOIN pg_namespace n
        ON n.nspname = '%s'
      LEFT JOIN pg_class c
        ON c.relnamespace = n.oid
       AND c.relname = '%s'
      LEFT JOIN pg_stats s
        ON s.attname = a.attname
       AND s.schemaname = n.nspname
       AND s.tablename = c.relname
      WHERE a.attrelid = '%s'::regclass
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY a.attnum;
  SQL

  attr_reader :name, :data_type, :description, :ordinal_position, :statistics
  attr_accessor :statistics

  def self.columns_for(account, table)
    columns_with_stats = table.with_gpdb_connection(account) do |conn|
      conn.query(COLUMN_METADATA_QUERY % [conn.quote_column_name(table.schema.name), conn.quote_column_name(table.name), conn.quote_column_name(table.name)])
    end

    columns_with_stats.map do |raw_column_data|
      column = GpdbColumn.new({
        :name => raw_column_data[0],
        :data_type => raw_column_data[1],
        :description => raw_column_data[2],
        :ordinal_position => raw_column_data[3]
      })
      params = raw_column_data[4..-1]
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
