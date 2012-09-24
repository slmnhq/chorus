require 'spec_helper'

describe Visualization::Boxplot, :database_integration => true do
  let(:account) { GpdbIntegration.real_gpdb_account }
  let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
  let(:dataset) { database.find_dataset_in_schema('base_table1', 'test_schema') }

  let(:visualization) do
    Visualization::Boxplot.new(dataset, {
        :x_axis => "category",
        :y_axis => "column2",
        :bins => 20,
        :filters => filters
    })
  end

  describe "#fetch!" do
    let(:filters) { nil }

    before do
      visualization.fetch!(account, 12345)
    end

    context "dataset is a table" do
      it "returns the boxplot data" do
        visualization.rows.should == [
            {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "44.44%", :count => 4},
            {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "33.33%", :count => 3},
            {:bucket => "apple", :min => 0.0, :median => 0.5, :max => 1.0, :first_quartile => 0.25, :third_quartile => 0.75, :percentage => "22.22%", :count => 2}
        ]
      end

      context "with filters" do
        let(:filters) { ["category != 'apple'"] }

        it "returns the boxplot data based on the filtered dataset" do
          visualization.rows.should == [
              {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "57.14%", :count => 4},
              {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "42.86%", :count => 3}
          ]
        end
      end

      context "with allcaps column names" do
        let(:dataset) { database.find_dataset_in_schema('allcaps_candy', 'test_schema') }
        let(:filters) { nil }
        let(:visualization) do
          Visualization::Boxplot.new(dataset, {
              :x_axis => "KITKAT",
              :y_axis => "STUFF",
              :bins => 20,
              :filters => filters
          })
        end

        it "fetches the rows correctly" do
          visualization.rows.should_not be_nil
        end
      end
    end

    context "dataset is a chorus view" do
      let(:dataset) { datasets(:executable_chorus_view) }

      it "returns the boxplot data" do
        visualization.rows.should == [
            {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "44.44%", :count => 4},
            {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "33.33%", :count => 3},
            {:bucket => "apple", :min => 0.0, :median => 0.5, :max => 1.0, :first_quartile => 0.25, :third_quartile => 0.75, :percentage => "22.22%", :count => 2}
        ]
      end

      context "with filters" do
        let(:filters) { ["category != 'apple'"] }

        it "returns the boxplot data based on the filtered dataset" do
          visualization.rows.should == [
              {:bucket => "papaya", :min => 5.0, :median => 6.5, :max => 8.0, :first_quartile => 5.5, :third_quartile => 7.5, :percentage => "57.14%", :count => 4},
              {:bucket => "orange", :min => 2.0, :median => 3.0, :max => 4.0, :first_quartile => 2.5, :third_quartile => 3.5, :percentage => "42.86%", :count => 3}
          ]
        end
      end
    end
  end
end