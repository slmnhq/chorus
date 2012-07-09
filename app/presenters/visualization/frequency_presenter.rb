module Visualization
  class FrequencyPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :columns, :to => :model

    def to_hash
      {
          :rows => rows,
          :columns => [{name: "bucket", typeCategory: "STRING"}, {name: "count", typeCategory: "WHOLE_NUMBER"}]
      }
    end
  end
end