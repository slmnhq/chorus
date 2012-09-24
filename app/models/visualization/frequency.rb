module Visualization
  class Frequency < Base
    attr_accessor :rows, :bins, :category, :filters, :type
    attr_writer :dataset, :schema

    def initialize(dataset=nil, attributes={})
      @type = attributes[:type]
      @bins = attributes[:bins]
      @category = attributes[:y_axis]
      @filters = attributes[:filters]
      @dataset = dataset
      @schema = dataset.try :schema
    end

    def fetch!(account, check_id)
      result = SqlExecutor.execute_sql(@schema, account, check_id, row_sql)
      @rows = result.rows.map { |row| { :bucket => row[0], :count => row[1].to_i } }
    end

    private

    def build_row_sql
      query = relation.
        group(relation[@category]).
        project(relation[@category].as('bucket'), Arel.sql('count(1)').as('count')).
        order(Arel.sql('count').desc).
        take(@bins)
      query = query.where(Arel.sql(@filters.join(" AND "))) if @filters.present?

      query.to_sql
    end
  end
end
