require 'spec_helper'

describe Visualization::Timeseries, :database_integration => true do
  let(:account) { GpdbIntegration.real_gpdb_account }
  let(:filters) { [%Q{"#{dataset.name}"."time_value" > '2012-03-03'},
                   %Q{"#{dataset.name}"."column1" < 5}] }

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
      visualization.fetch!(account, 12345)
    end

    context "with a table" do
      let(:database) { GpdbIntegration.real_database }
      let(:dataset) { database.find_dataset_in_schema('base_table1', 'test_schema') }

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
        it "returns the timeseries data based on the filtered dataset" do
          visualization.rows.should == [
              {:value => 2, :time => "2012-03"},
              {:value => 2, :time => "2012-04"},
              {:value => 1, :time => "2012-05"}
          ]
        end
      end
    end

    context "with a chorus view" do
      let(:dataset) { datasets(:executable_chorus_view) }

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
end