module Visualization
  class FrequencyPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :columns, :to => :model

    def to_hash
      {
          :rows => rows,
          :columns => [{name: "bucket", type_category: "STRING"}, {name: "count", type_category: "WHOLE_NUMBER"}]
      }
    end
  end
end