require 'spec_helper'

describe Visualization::Heatmap do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'public') }
  let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
  let(:dataset) { database.find_dataset_in_schema('heatmap_table', 'test_schema3') }
  let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }
  let(:relation) { %Q{"#{schema.name}"."#{dataset.name}"} }

  let(:visualization) do
    Visualization::Heatmap.new(dataset, {
      :x_bins => 3,
      :y_bins => 3,
      :x_axis => 'column1',
      :y_axis => 'column2',
      :filters => filters
    })
  end

  describe "#fetch!", :database_integration => true do
    let(:dataset) { GpdbTable.find_by_name!('heatmap_table') }
    let(:instance_account) { GpdbIntegration.real_gpdb_account }

    before do
      refresh_chorus
      visualization.fetch!(instance_account, 12345)
    end

    context "no filters" do
      let(:filters) { nil }

      let(:attributes) do
        {
            :x_bins => 3,
            :y_bins => 3,
            :x_axis => 'column1',
            :y_axis => 'column2'
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization.rows.should == [
          {:x =>1, :y =>1, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[2.0, 3.33]},
          {:x =>1, :y =>2, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[3.33, 4.67]},
          {:x =>1, :y =>3, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[4.67, 6.0]},
          {:x =>2, :y =>1, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[2.0, 3.33]},
          {:x =>2, :y =>2, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[3.33, 4.67]},
          {:x =>2, :y =>3, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[4.67, 6.0]},
          {:x =>3, :y =>1, :value =>1, :xLabel =>[4.67, 6.0], :yLabel =>[2.0, 3.33]},
          {:x =>3, :y =>2, :value =>1, :xLabel =>[4.67, 6.0], :yLabel =>[3.33, 4.67]},
          {:x =>3, :y =>3, :value =>2, :xLabel =>[4.67, 6.0], :yLabel =>[4.67, 6.0]}
        ]

      end
    end

    context "with filters" do
      let(:filters) { ['"heatmap_table"."category" != \'green\'', '"heatmap_table"."category" != \'cornflower blue\''] }

      it "returns the frequency data based on the filtered dataset" do
        visualization.rows.should == [
          {:x =>1, :y =>1, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[2.0, 3.33]},
          {:x =>1, :y =>2, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[3.33, 4.67]},
          {:x =>1, :y =>3, :value =>1, :xLabel =>[2.0, 3.33], :yLabel =>[4.67, 6.0]},
          {:x =>2, :y =>1, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[2.0, 3.33]},
          {:x =>2, :y =>2, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[3.33, 4.67]},
          {:x =>2, :y =>3, :value =>1, :xLabel =>[3.33, 4.67], :yLabel =>[4.67, 6.0]},
          {:x =>3, :y =>1, :value =>1, :xLabel =>[4.67, 6.0], :yLabel =>[2.0, 3.33]},
          {:x =>3, :y =>2, :value =>0, :xLabel =>[4.67, 6.0], :yLabel =>[3.33, 4.67]},
          {:x =>3, :y =>3, :value =>1, :xLabel =>[4.67, 6.0], :yLabel =>[4.67, 6.0]}
        ]
      end
    end
  end
end
