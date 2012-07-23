module Visualization
  class BoxplotPresenter < Presenter
    include DbTypesToChorus
    
    delegate :type, :bins, :values, :category, :rows, :type, :filters, :to => :model
    
    def to_hash
      {
          :type => type,
          :bins => bins,
          :x_axis => category,
          :y_axis => values,
          :rows => rows,
          :filters => filters,
          :columns => [
              {name: "bucket", type_category: "STRING"},
              {name: "min", type_category: "REAL_NUMBER"},
              {name: "firstQuartile", type_category: "REAL_NUMBER"},
              {name: "median", type_category: "REAL_NUMBER"},
              {name: "thirdQuartile", type_category: "REAL_NUMBER"},
              {name: "max", type_category: "REAL_NUMBER"},
              {name: "percentage", type_category: "STRING"}
          ]
      }
    end
  end
end