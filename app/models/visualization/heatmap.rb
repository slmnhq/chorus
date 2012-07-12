module Visualization
  class Heatmap
    attr_reader :rows
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @x_axis = attributes[:x_axis]
      @y_axis = attributes[:y_axis]
      @x_bins = attributes[:x_bins]
      @y_bins = attributes[:y_bins]
      @dataset = dataset
      @schema = dataset.try :schema
    end

    def relation_raw
      %Q{"#{@schema.name}"."#{@dataset.name}"}
    end

    def relation
      Arel::Table.new(relation_raw)
    end

    def column_information
      Arel::Table.new(%Q{"information_schema"."columns"})
    end

    def build_min_max_sql
      query = relation.project(
        Arel.sql("max('#{@x_axis}') AS maxX, min('#{@x_axis}') AS minX, max('#{@y_axis}') AS maxY, min('#{@y_axis}') AS minY"))

      query.to_sql
    end

    def build_row_sql
      min_x, max_x, min_y, max_y = fetch_min_max

      "SELECT *, count(*) AS value FROM ( SELECT width_bucket( CAST(\"#{@x_axis}\" AS numeric), CAST(#{min_x} AS numeric), CAST(#{max_x} AS numeric), 4) AS xbin, width_bucket( CAST(\"#{@y_axis}\" AS numeric), CAST(#{min_y} AS numeric), CAST(#{max_y} AS numeric), 6) AS ybin FROM ( SELECT * FROM #{relation_raw}) AS subquery WHERE \"#{@x_axis}\" IS NOT NULL AND \"#{@y_axis}\" IS NOT NULL) AS foo GROUP BY xbin, ybin"
    end

    def fetch_min_max
      @min_max ||= @schema.with_gpdb_connection(@account) do |conn|
        conn.exec_query(build_min_max_sql)
      end

      return @min_max[:maxX], @min_max[:minX], @min_max[:maxY], @min_max[:minY]
    end

    def fetch!(account)
      @account = account

      row_data = @schema.with_gpdb_connection(account) do |conn|
        conn.exec_query(build_row_sql)
      end

      @rows = fill_missing(row_data.reverse)
    end

    def fill_missing(rows)
      xys = rows.map { |row| [row['x'].to_i, row['y'].to_i] }

      (1..@x_bins).each do |x|
        (1..@y_bins).each do |y|
          unless xys.include? [x, y]
            rows << { 'value' => '', 'x' => x.to_s, 'y' => y.to_s}
          end
        end
      end

      min_x, max_x, min_y, max_y = fetch_min_max
      x_bins_size = ((max_x - min_x) / @x_bins)
      y_bins_size = ((max_y - min_y) / @y_bins)

      rows.each do |row|
        x_bin_start = min_x + (x_bins_size * (row['x'].to_i - 1))
        y_bin_start = min_y + (y_bins_size * (row['y'].to_i - 1))

        row['xLabel'] = [x_bin_start, x_bin_start + x_bins_size]
        row['yLabel'] = [y_bin_start, y_bin_start + y_bins_size]
      end

      rows
    end
  end
end
