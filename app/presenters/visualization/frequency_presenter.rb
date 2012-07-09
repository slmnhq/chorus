module Visualization
  class FrequencyPresenter < Presenter
    include DbTypesToChorus

    delegate :rows, :columns, :to => :model

    def to_hash
      {
          :rows => rows,
          :columns => columns.map { |c| {:name => c['name'], :typeCategory => to_category(c['typeCategory']) } }
      }
    end
  end
end