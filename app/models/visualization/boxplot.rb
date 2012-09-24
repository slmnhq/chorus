require 'boxplot_summary'

module Visualization
  class Boxplot < Base
    attr_accessor :rows, :bins, :category, :values, :filters, :type
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @bins = attributes[:bins].to_i
      @category = attributes[:x_axis]
      @values = attributes[:y_axis]
      @filters = attributes[:filters]
      @type = attributes[:type]
      @dataset = dataset
      @schema = dataset.try :schema
    end

    def fetch!(account, check_id)
      result = SqlExecutor.execute_sql(@schema, account, check_id, row_sql)
      row_data = result.rows.map { |row| {:bucket => row[0], :ntile => row[1].to_i, :min => row[2].to_f, :max => row[3].to_f, :count => row[4].to_i} }
      @rows = BoxplotSummary.summarize(row_data, @bins)
    end

    private

    def build_row_sql
      filters = @filters.present? ? "WHERE #{@filters.join(" AND ")}" : ""

      innerQuery = <<-SQL
        select innerQuery."#{@category}", innerQuery.ntile, min(innerQuery."#{@values}"), max(innerQuery."#{@values}"), count(*) cnt from
          (select "#{@category}", "#{@values}", ntile(4) OVER (t) AS ntile FROM #{@dataset.scoped_name} #{filters} WINDOW t AS (PARTITION BY "#{@category}" ORDER BY "#{@values}")) as innerQuery
          GROUP BY innerQuery."#{@category}", innerQuery.ntile ORDER BY innerQuery."#{@category}", innerQuery.ntile
      SQL

      <<-SQL
        SELECT "#{@category}", ntile, min, max, cnt, sum(cnt) OVER(w) AS total FROM (#{innerQuery}) AS outerQuery
          WINDOW w AS (PARTITION BY "#{@category}") ORDER BY total desc, "#{@category}", ntile LIMIT #{(@bins * 4).to_s}
      SQL
    end
  end
end
