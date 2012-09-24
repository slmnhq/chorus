module Visualization
  class Histogram < Base
    attr_accessor :rows, :bins, :category, :filters, :type
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @type = attributes[:type]
      @bins = attributes[:bins].to_i
      @category = attributes[:x_axis]
      @filters = attributes[:filters]
      @dataset = dataset
      @schema = dataset.try :schema
    end

    def build_row_sql
      category = %Q{#{@dataset.scoped_name}."#{@category}"}

      width_bucket = "width_bucket(CAST(#{category} as numeric), CAST(#{@min} as numeric), CAST(#{@max} as numeric), #{@bins})"

      query = relation.
          group(width_bucket).
          project(Arel.sql(width_bucket).as("bucket"), Arel.sql("COUNT(#{width_bucket})").as('frequency')).
          where(relation[@category].not_eq(nil))

      query = query.where(Arel.sql(@filters.join(" AND "))) if @filters.present?

      query.to_sql
    end

    def build_min_max_sql
      query = relation.
          project(relation[@category].minimum.as('min'), relation[@category].maximum.as('max'))

      query.to_sql
    end

    def fetch!(account, check_id)

      min_max_result = SqlExecutor.execute_sql(@schema, account, check_id, min_max_sql)

      @min = min_max_result.rows[0][0].to_f
      @max = min_max_result.rows[0][1].to_f

      result = SqlExecutor.execute_sql(@schema, account, check_id, row_sql)
      row_data = result.rows.map { |row| {:bin => row[0].to_i, :frequency => row[1].to_i} }

      @rows = massage(row_data)
    end


    def massage(row_data)
      new_row_data = []
      bin_width = ((@max - @min)/@bins)

      for i in 1..@bins
        detected_row = row_data.detect { |r| r[:bin] == i }

        low_range = ((i-1) * bin_width + @min).round(1)
        high_range = (i * bin_width + @min).round(1)

        if detected_row
          new_row_data << {:bin => [low_range, high_range],
                           :frequency => detected_row[:frequency]}
        else
          new_row_data << {:bin => [low_range, high_range],
                           :frequency => 0}
        end
      end

      extra_bin = row_data.detect { |r| r[:bin] == (@bins + 1) }
      new_row_data[@bins-1][:frequency] = new_row_data[@bins-1][:frequency] + extra_bin[:frequency] if extra_bin

      new_row_data
    end
  end
end
