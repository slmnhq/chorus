module Visualization
  class Heatmap
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @x_axis = attributes[:x_axis]
      @y_axis = attributes[:y_axis]
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
      # sql = "SELECT max('#{@x_axis}') AS maxX, min('#{@x_axis}') AS minX, 
      # max('#{@y_axis}') AS maxY, min('#{@y_axis}') AS minY FROM #{relation} AS subquery"

      query = relation.project(
        Arel.sql("max('#{@x_axis}') AS maxX, min('#{@x_axis}') AS minX, max('#{@y_axis}') AS maxY, min('#{@y_axis}') AS minY"))

      query.to_sql
    end

    def build_column_sql
      query = column_information.
        where(column_information[:table_name].eq(%Q{#{@dataset.name}})).
        where(column_information[:table_schema].eq(%Q{#{@schema.name}})).
        where(column_information[:column_name].in([@x_axis, @y_axis])).
        project(column_information[:column_name].as('name'), column_information[:data_type].as('type_category'))

      query.to_sql
    end

    def build_row_sql
      max_x, min_x, max_y, min_y = fetch_min_max

      "SELECT *, count(*) AS value FROM ( SELECT width_bucket( CAST(\"#{@x_axis}\" AS numeric), CAST(#{min_x} AS numeric), CAST(#{max_x} AS numeric), 4) AS xbin, width_bucket( CAST(\"#{@y_axis}\" AS numeric), CAST(#{min_y} AS numeric), CAST(#{max_y} AS numeric), 6) AS ybin FROM ( SELECT * FROM #{relation_raw}) AS subquery WHERE \"#{@x_axis}\" IS NOT NULL AND \"#{@y_axis}\" IS NOT NULL) AS foo GROUP BY xbin, ybin"
    end

    def fetch_min_max
      min_max = @schema.with_gpdb_connection(@account) do |conn|
        conn.exec_query(build_min_max_sql)
      end

      return min_max[:maxX], min_max[:minX], min_max[:maxY], min_max[:minY]
    end

    def fetch!(account)
      @account = account

      column_data = @schema.with_gpdb_connection(account) do |conn|
        conn.exec_query(build_column_sql)
      end

      row_data = @schema.with_gpdb_connection(account) do |conn|
        conn.exec_query(build_row_sql)
      end

      @rows = row_data.reverse
      @columns = column_data
    end
  end
end
