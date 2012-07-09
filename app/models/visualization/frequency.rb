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

    def build_column_sql
      relation = Arel::Table.new(%Q{"information_schema"."columns"})
      query = relation.
        where(relation[:table_name].eq(%Q{#{@dataset.name}})).
        where(relation[:table_schema].eq(%Q{#{@schema.name}})).
        where(relation[:column_name].eq(%Q{#{@category}})).
        project(relation[:column_name].as('name'), relation[:data_type].as('type_category'))

      query.to_sql
    end

    def fetch!(account)
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
