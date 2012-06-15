class GpdbColumn
  extend ActiveSupport::Memoizable

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

  def self.columns_for(account, table)
    columns = table.with_gpdb_connection(account) do |conn|
      conn.query(COLUMN_METADATA_QUERY % [table.schema.name, table.name, table.name])
    end

    columns.map do |column|
      column_stats = GpdbColumnStatistics.new(*column[4..-1])
      column = GpdbColumn.new({
        :name => column[0],
        :data_type => column[1],
        :description => column[2],
        :ordinal_position => column[3]
      })
      column.statistics = column_stats
      column
    end
  end

  def initialize(attributes={})
    @name = attributes[:name]
    @data_type = attributes[:data_type]
    @description = attributes[:description]
    @ordinal_position = attributes[:ordinal_position]
  end

  attr_accessor :statistics

  def simplified_type
    ActiveRecord::ConnectionAdapters::PostgreSQLColumn.new(name, nil, data_type, nil).type
  end
  memoize :simplified_type
end
