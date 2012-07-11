require 'spec_helper'

describe Visualization do
  let(:table) { FactoryGirl.build_stubbed(:gpdb_table) }

  describe ".build" do
    context "frequency visualization" do
      let(:params) { {:type => 'frequency'} }

      it "builds a frequency visualization" do
        visualization = described_class.build(table, params)

        visualization.should be_a_kind_of(Visualization::Frequency)
      end
    end

    context "histogram visualization" do
      let(:params) { {:type => 'histogram'}}

      it "builds a histogram visualization" do
        visualization = described_class.build(table, params)

        visualization.should be_a_kind_of(Visualization::Histogram)
      end

    end
  end
end