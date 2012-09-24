require 'spec_helper'

describe Visualization::Frequency, :database_integration => true do
  let(:account) { GpdbIntegration.real_gpdb_account }
  let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
  let(:dataset) { database.find_dataset_in_schema('base_table1', 'test_schema') }

  let(:visualization) do
    Visualization::Frequency.new(dataset, {
      :bins => 2,
      :y_axis => 'category',
      :filters => filters
    })
  end

  describe "#fetch!" do
    before do
      visualization.fetch!(account, 12345)
    end

    context "dataset is a table" do
      context "with no filter" do
        let(:filters) { nil }

        it "returns the frequency data" do
          visualization.rows.should == [
              {:count => 4, :bucket => 'papaya'},
              {:count => 3, :bucket => "orange"}
          ]
        end
      end

      context "with filters" do
        let(:filters) { ['"base_table1"."column1" > 0', '"base_table1"."column2" < 5'] }

        it "returns the frequency data based on the filtered dataset" do
          visualization.rows.should == [
              {:count => 2, :bucket => "orange"},
              {:count => 1, :bucket => 'apple'}
          ]
        end
      end
    end

    context "dataset is a chorus view" do
      let(:dataset) { datasets(:executable_chorus_view) }
      context "with no filter" do
        let(:filters) { nil }

        it "returns the frequency data" do
          visualization.rows.should == [
              {:count => 4, :bucket => 'papaya'},
              {:count => 3, :bucket => "orange"}
          ]
        end
      end

      context "with filters" do
        let(:filters) { ['"CHORUS_VIEW"."column1" > 0', '"CHORUS_VIEW"."column2" < 5'] }

        it "returns the frequency data based on the filtered dataset" do
          visualization.rows.should == [
              {:count => 2, :bucket => "orange"},
              {:count => 1, :bucket => 'apple'}
          ]
        end
      end
    end
  end
end
