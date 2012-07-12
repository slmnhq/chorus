module Visualization
  class Heatmap
    attr_accessor :x_bins, :y_bins, :x_axis, :y_axis, :rows
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      p "attrib: #{attributes}"
      @x_axis = attributes[:x_axis]
      @y_axis = attributes[:y_axis]
      @x_bins = attributes[:x_bins].to_i
      @y_bins = attributes[:y_bins].to_i
      @filters = attributes[:filters]
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
        relation[@x_axis].minimum.as('xmin'), relation[@x_axis].maximum.as('xmax'),
        relation[@y_axis].minimum.as('ymin'), relation[@y_axis].maximum.as('ymax')
      )

      query.to_sql
    end

    def build_row_sql
      min_x, max_x, min_y, max_y = fetch_min_max

      query = "SELECT *, count(*) AS value
      FROM ( 
        SELECT width_bucket(
      CAST(\"#{@x_axis}\" AS numeric),
      CAST(#{min_x} AS numeric),
      CAST(#{max_x} AS numeric),
      #{x_bins}) AS x,
      width_bucket( CAST(\"#{@y_axis}\" AS numeric),
      CAST(#{min_y} AS numeric),
      CAST(#{max_y} AS numeric),
      #{y_bins}) AS y
      FROM ( SELECT * FROM #{relation_raw}"

      query += " WHERE " + @filters.join(" AND ") if @filters.present?

      query += ") AS subquery
      WHERE \"#{@x_axis}\" IS NOT NULL
      AND \"#{@y_axis}\" IS NOT NULL) AS foo
      GROUP BY x, y"

      query
    end

    def fetch_min_max
      @min_max ||= @schema.with_gpdb_connection(@account) do |conn|
        conn.exec_query(build_min_max_sql)
      end.first

      return @min_max['xmin'], @min_max['xmax'], @min_max['ymin'], @min_max['ymax']
    end

    def fetch!(account, _)
      @account = account

      row_data = @schema.with_gpdb_connection(account) do |conn|
        conn.exec_query(build_row_sql)
      end

      @rows = fill_missing(row_data.reverse)
    end

    def fill_missing(rows)
      min_x, max_x, min_y, max_y = fetch_min_max
      x_bins_size = ((max_x - min_x) / @x_bins.to_f)
      y_bins_size = ((max_y - min_y) / @y_bins.to_f)

      filled_rows = []
      (1..@x_bins).each do |x|
        (1..@y_bins).each do |y|
          detected_row = rows.detect { |r| r['x'].to_i == x && r['y'].to_i == y }

          x_bin_start = min_x + (x_bins_size * (x - 1))
          y_bin_start = min_y + (y_bins_size * (y - 1))

          x_label = [x_bin_start.round(2), (x_bin_start + x_bins_size).round(2)]
          y_label = [y_bin_start.round(2), (y_bin_start + y_bins_size).round(2)]

          if detected_row
            new_row = detected_row.merge({
              'xLabel' => x_label,
              'yLabel' => y_label
            })
          else
            new_row = { 'x' => x, 'y' => y, 'value' => 0, 'xLabel' => x_label, 'yLabel' => y_label }
          end

          if x == @x_bins
            extra_row = rows.detect { |r| r['y'] == y && r['x'] == (@x_bins+1)}
            extra_row && new_row['value'] += extra_row['value']
          end

          filled_rows << new_row
        end

          extra_row = rows.detect { |r| r['x'] == x && r['y'] == (@y_bins+1)}
          extra_row && filled_rows.last['value'] += extra_row['value']
      end

      extra_row = rows.detect { |r| r['x'] == (@x_bins+1) && r['y'] == (@y_bins+1) }
      extra_row && filled_rows.last['value'] += extra_row['value']

      filled_rows
    end
  end
end
