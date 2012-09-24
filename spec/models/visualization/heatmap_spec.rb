require 'spec_helper'

describe Visualization::Heatmap do
  let(:database) { GpdbIntegration.real_database }
  let(:visualization) do
    Visualization::Heatmap.new(dataset, {
        :x_bins => 3,
        :y_bins => 3,
        :x_axis => 'column1',
        :y_axis => 'column2',
        :filters => filters
    })
  end
  let(:instance_account) { GpdbIntegration.real_gpdb_account }

  describe "#fetch!", :database_integration => true do

    before do
      visualization.fetch!(instance_account, 12345)
    end

    context 'dataset is a table' do
      let(:dataset) { database.find_dataset_in_schema('heatmap_table', 'test_schema3') }
      context "no filters" do
        let(:filters) { nil }

        it "creates the SQL based on the grouping and bins" do
          visualization.rows.should == [
              {:x => 1, :y => 1, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [2.0, 3.33]},
              {:x => 1, :y => 2, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [3.33, 4.67]},
              {:x => 1, :y => 3, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [4.67, 6.0]},
              {:x => 2, :y => 1, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [2.0, 3.33]},
              {:x => 2, :y => 2, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [3.33, 4.67]},
              {:x => 2, :y => 3, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [4.67, 6.0]},
              {:x => 3, :y => 1, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [2.0, 3.33]},
              {:x => 3, :y => 2, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [3.33, 4.67]},
              {:x => 3, :y => 3, :value => 2, :xLabel => [4.67, 6.0], :yLabel => [4.67, 6.0]}
          ]

        end
      end

      context "with filters" do
        let(:filters) { ['"heatmap_table"."category" != \'green\'', '"heatmap_table"."category" != \'cornflower blue\''] }

        it "returns the frequency data based on the filtered dataset" do
          visualization.rows.should == [
              {:x => 1, :y => 1, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [2.0, 3.33]},
              {:x => 1, :y => 2, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [3.33, 4.67]},
              {:x => 1, :y => 3, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [4.67, 6.0]},
              {:x => 2, :y => 1, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [2.0, 3.33]},
              {:x => 2, :y => 2, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [3.33, 4.67]},
              {:x => 2, :y => 3, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [4.67, 6.0]},
              {:x => 3, :y => 1, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [2.0, 3.33]},
              {:x => 3, :y => 2, :value => 0, :xLabel => [4.67, 6.0], :yLabel => [3.33, 4.67]},
              {:x => 3, :y => 3, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [4.67, 6.0]}
          ]
        end
      end
    end

    context 'dataset is a chorus view' do
      let(:dataset) {
        ChorusView.new({:name => "CHORUS_VIEW",
                        :schema => database.schemas.find_by_name!("test_schema3"),
                        :query => "select * from heatmap_table"
                       }, :without_protection => true)
      }

      context "no filters" do
        let(:filters) { nil }

        it "creates the SQL based on the grouping and bins" do
          visualization.rows.should == [
              {:x => 1, :y => 1, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [2.0, 3.33]},
              {:x => 1, :y => 2, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [3.33, 4.67]},
              {:x => 1, :y => 3, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [4.67, 6.0]},
              {:x => 2, :y => 1, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [2.0, 3.33]},
              {:x => 2, :y => 2, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [3.33, 4.67]},
              {:x => 2, :y => 3, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [4.67, 6.0]},
              {:x => 3, :y => 1, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [2.0, 3.33]},
              {:x => 3, :y => 2, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [3.33, 4.67]},
              {:x => 3, :y => 3, :value => 2, :xLabel => [4.67, 6.0], :yLabel => [4.67, 6.0]}
          ]

        end
      end

      context "with filters" do
        let(:filters) { ['"CHORUS_VIEW"."category" != \'green\'', '"CHORUS_VIEW"."category" != \'cornflower blue\''] }

        it "returns the frequency data based on the filtered dataset" do
          visualization.rows.should == [
              {:x => 1, :y => 1, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [2.0, 3.33]},
              {:x => 1, :y => 2, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [3.33, 4.67]},
              {:x => 1, :y => 3, :value => 1, :xLabel => [2.0, 3.33], :yLabel => [4.67, 6.0]},
              {:x => 2, :y => 1, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [2.0, 3.33]},
              {:x => 2, :y => 2, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [3.33, 4.67]},
              {:x => 2, :y => 3, :value => 1, :xLabel => [3.33, 4.67], :yLabel => [4.67, 6.0]},
              {:x => 3, :y => 1, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [2.0, 3.33]},
              {:x => 3, :y => 2, :value => 0, :xLabel => [4.67, 6.0], :yLabel => [3.33, 4.67]},
              {:x => 3, :y => 3, :value => 1, :xLabel => [4.67, 6.0], :yLabel => [4.67, 6.0]}
          ]
        end
      end
    end
  end
end
