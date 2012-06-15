class GpdbColumnStatisticsPresenter < Presenter
  delegate :null_fraction, :common_values, :number_distinct, :min, :max, :to => :model

  def to_hash
    {
      :distinct_value => number_distinct,
      :common_values => common_values,
      :null_fraction => null_fraction,
      :min => min,
      :max => max
    }
  end
end