require 'spec_helper'

describe Visualization::Timeseries, :database_integration => true do
  let(:account) { real_gpdb_account }
  let(:dataset) { GpdbTable.find_by_name!('base_table1') }

  let(:visualization) do
    Visualization::Timeseries.new(dataset, {
      :time_interval => "month",
      :aggregation => "sum",
      :x_axis => "time_value",
      :y_axis => "column1",
      :filters => filters
    })
  end

  describe "#fetch!" do
    before do
      refresh_chorus
      visualization.fetch!(account, 12345)
    end

    context "with no filter" do
      let(:filters) { nil }

      it "returns the timeseries data" do
        visualization.rows.should == [
          {:value => 3, :time => '2012-03'},
          {:value => 2, :time => '2012-04'},
          {:value => 1, :time => "2012-05"}
        ]
      end
    end

    context "with filters" do
      let(:filters) { ['"base_table1"."time_value" > \'2012-03-03\'', '"base_table1"."column1" < 5'] }

      it "returns the timeseries data based on the filtered dataset" do
        visualization.rows.should == [
          {:value => 2, :time => "2012-03"},
          {:value => 2, :time => "2012-04"},
          {:value => 1, :time => "2012-05"}
        ]
      end
    end
  end
end