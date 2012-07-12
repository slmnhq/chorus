require 'spec_helper'

describe Visualization::Frequency, :database_integration => true do
  let(:account) { real_gpdb_account }
  let(:dataset) { GpdbTable.find_by_name!('base_table1') }

  let(:visualization) do
    Visualization::Frequency.new(dataset, {
      :bins => 2,
      :y_axis => 'category',
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

      it "returns the frequency data" do
        visualization.rows.should == [
          { :count => "4", :bucket => 'papaya' },
          { :count => "3", :bucket => "orange" }
        ]
      end
    end

    context "with filters" do
      let(:filters) { ['"base_table1"."column1" > 0', '"base_table1"."column2" < 5'] }

      it "returns the frequency data based on the filtered dataset" do
        visualization.rows.should == [
          { :count => "2", :bucket => "orange" },
          { :count => "1", :bucket => 'apple' }
        ]
      end
    end
  end
end
