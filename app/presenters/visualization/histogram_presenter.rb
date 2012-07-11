module Visualization
  class HistogramPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :to => :model

    def to_hash
      {
          :rows => rows,
          :columns => [{name: "bin", type_category: "STRING"}, {name: "frequency", type_category: "WHOLE_NUMBER"}]
      }
    end
  end
end