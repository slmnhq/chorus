module Visualization
  class HeatmapPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :to => :model

    def to_hash
      {
        :rows => rows,
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
