module Visualization
  class TimeseriesPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :time, :value, :time_interval, :aggregation, :filters, :type, :to => :model

    def to_hash
      {
        :type => type,
        :x_axis => time,
        :y_axis => value,
        :time_interval => time_interval,
        :aggregation => aggregation,
        :filters => filters,
        :rows => rows,
        :columns => [{name: "time", type_category: "DATETIME"}, {name: "value", type_category: "REAL_NUMBER"}]
      }
    end
  end
end