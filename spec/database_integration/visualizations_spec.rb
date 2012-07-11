require 'spec_helper'

describe "Visualizations", :type => :database_integration do
  # let(:schema) { GpdbSchema.find_by_name('gpdb_test_schema') }
  let(:account) { real_gpdb_account }

  before do
    refresh_chorus
  end

  it "returns the visualization frequency data" do
    dataset = GpdbTable.find_by_name!('base_table1')

    visualization = Visualization::Frequency.new(dataset, {
        :bins => 20,
        :y_axis => 'category'
    })

    visualization.fetch!(account)

    visualization.rows.should include({'count' => 3, 'bucket' => 'orange'})
    visualization.rows.should include({'count' => 2, 'bucket' => 'apple'})
  end

  it "returns the visualization histogram data" do
    dataset = GpdbTable.find_by_name!('base_table1')
  end
end