module Visualization
  class HeatmapPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :x_bins, :y_bins, :x_axis, :y_axis, :type, :filters, :to => :model

    def to_hash
      {
        :x_bins => x_bins,
        :y_bins => y_bins,
        :x_axis => x_axis,
        :y_axis => y_axis,
        :type => type,
        :rows => rows,
        :filters => filters,
        :columns => [
          { name: 'x', typeCategory: 'WHOLE_NUMBER' },
          { name: 'y', typeCategory: 'WHOLE_NUMBER' },
          { name: 'value', typeCategory: 'REAL_NUMBER' },
          { name: 'xLabel', typeCategory: 'STRING' },
          { name: 'yLabel', typeCategory: 'STRING' }
        ]
      }
    end
  end
end
