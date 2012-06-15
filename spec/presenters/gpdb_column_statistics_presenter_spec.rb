require "spec_helper"

describe GpdbColumnStatisticsPresenter, :type => :view do
  let(:stats) { GpdbColumnStatistics.new(null_frac, n_distinct, most_common_vals, most_common_freqs, histogram_bounds, row_count, treat_as_enumerable) }
  let(:null_frac) { '0.5' }
  let(:n_distinct) { '45' }
  let(:most_common_vals) { '{1,2}' }
  let(:most_common_freqs) { nil }
  let(:histogram_bounds) { '{3,4,5}' }
  let(:row_count) { nil }
  let(:treat_as_enumerable) { true }

  subject { GpdbColumnStatisticsPresenter.new(stats, view) }

  it "has basic values" do
    hash = subject.to_hash
    hash[:distinct_value].should == 45
    hash[:common_values].should == ["1", "2"]
    hash[:null_fraction].should == 0.5
    hash[:min].should == '3'
    hash[:max].should == '5'
  end
end
