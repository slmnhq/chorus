module Visualization
  class FrequencyPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :columns, :bins, :category, :filters, :type, :to => :model

    def to_hash
      {
          :bins => bins,
          :y_axis => category,
          :filters => filters,
          :type => type,
          :rows => rows,
          :columns => [{name: "bucket", type_category: "STRING"}, {name: "count", type_category: "WHOLE_NUMBER"}]
      }
    end
  end
end