class GpdbColumnPresenter < Presenter
  include DbTypesToChorus

  delegate :name, :data_type, :simplified_type, :description, :to => :model

  def to_hash
    {
      :name => h(name),
      :data_type => h(data_type),
      :type_category => type_category,
      :description => h(description),
      :statistics => statistics
    }
  end

  def type_category
    to_category(data_type)
  end

  def statistics
    return { } unless model.statistics.present?
    present(model.statistics)
  end

  def complete_json?
    true
  end
end