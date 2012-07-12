module Visualization
  class TimeseriesPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :to => :model

    def to_hash
      {
        :rows => rows,
        :columns => [{name: "time", type_category: "DATETIME"}, {name: "value", type_category: "REAL_NUMBER"}]
      }
    end
  end
end