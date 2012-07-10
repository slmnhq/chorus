module Visualization
  class Frequency
    attr_accessor :rows, :columns
    attr_writer :bins, :category, :filters, :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @bins = attributes[:bins]
      @category = attributes[:y_axis]
      @filters = attributes[:filters]
      @dataset = dataset
      @schema = dataset.try :schema
    end

    def build_row_sql
      relation = Arel::Table.new(%Q{"#{@schema.name}"."#{@dataset.name}"})
      query = relation.
        group(relation[@category]).
        project(relation[@category].as('bucket'), Arel.sql('count(1)').as('count')).
        order(Arel.sql('count').desc).
        take(@bins)
      query = query.where(Arel.sql(@filters.join(" AND "))) if @filters.present?

      query.to_sql
    end

    def fetch!(account, check_id)
      result = SqlExecutor.execute_sql(@schema, account, check_id, build_row_sql)
      row_data = result.rows.map { |row| { :bucket => row[0], :count => row[1] } }

      @rows = row_data.reverse
      @columns = result.columns
    end
  end
end
