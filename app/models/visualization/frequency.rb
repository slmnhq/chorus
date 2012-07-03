module Visualization
  class Frequency
    attr_reader :rows, :columns

    def initialize(dataset, attributes)
      @bins = attributes[:bins]
      @group = attributes[:y_axis]
      @filters = attributes[:filters]
      @dataset = dataset
      @schema = dataset.schema
    end

    def build_sql
      relation = Arel::Table.new(%Q{"#{@schema.name}"."#{@dataset.name}"})

      query = relation.
        group(relation[@group]).
        project(relation[@group].as('bucket'), Arel.sql('count(1)').as('count')).
        order(Arel.sql('count').desc).
        take(@bins)

      query = query.where(Arel.sql(@filters)) if @filters.present?

      query.to_sql
    end

    def fetch!(account)
      results = @schema.with_gpdb_connection(account) do |conn|
        conn.exec_query(build_sql)
      end

      @columns = results[0].keys.map { |key| {:name => key} }
      @rows = results
    end
  end
end
