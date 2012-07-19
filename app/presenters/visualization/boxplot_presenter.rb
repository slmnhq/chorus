module Visualization
  class BoxplotPresenter < Presenter
    include DbTypesToChorus
    
    delegate :rows, :to => :model
    
    def to_hash
      {
          :rows => rows,
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