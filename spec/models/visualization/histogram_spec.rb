require 'spec_helper'

describe Visualization::Histogram, :database_integration => true do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'analytics') }
  let(:dataset) { FactoryGirl.build_stubbed(:gpdb_table, :name => '2009_sfo_customer_survey', :schema => schema) }
  let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }

  describe "#fetch!" do
    it "returns visualization structure" do
      visualization = described_class.new(dataset, {
          :bins => 3,
          :x_axis => 'airport_cleanliness'
      })

      mock(SqlExecutor).execute_sql(schema, instance_account, 17, visualization.build_min_max_sql) do
        SqlResult.new.tap do |result|
          result.add_column("min", "double")
          result.add_column("max", "double")
          result.add_rows([['1.0', '9.0']])
        end
      end

      visualization.instance_variable_set(:@min, "1.0")
      visualization.instance_variable_set(:@max, "9.0")
      mock(SqlExecutor).execute_sql(schema, instance_account, 17, visualization.build_row_sql) do
        SqlResult.new.tap do |result|
          result.add_column("bin", "text")
          result.add_column("frequency", "int8")
          result.add_rows([
            ['1', '2'],
            ['3', '6'],
            ['4', '9']
          ])
        end
      end

      visualization.fetch!(instance_account, 17)

      visualization.rows.should include({:bin => [1.0, 3.7], :frequency => 2})
      visualization.rows.should include({:bin => [3.7, 6.3], :frequency => 0})
      visualization.rows.should include({:bin => [6.3, 9.0], :frequency => 15})
    end
  end

  context "integration" do
    let(:account) { real_gpdb_account }
    let(:dataset) { GpdbTable.find_by_name!('base_table1') }

    let(:visualization) do
      Visualization::Histogram.new(dataset, {
          :bins => 2,
          :x_axis => 'column1',
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
              {:bin => [0, 0.5], :frequency => 3},
              {:bin => [0.5, 1.0], :frequency => 6}
          ]
        end
      end

      context "with filters" do
        let(:filters) { ['"base_table1"."category" = \'papaya\''] }

        it "returns the frequency data based on the filtered dataset" do
          visualization.rows.should == [
              {:bin => [0, 0.5], :frequency => 1},
              {:bin => [0.5, 1.0], :frequency => 3}
          ]
        end
      end
    end
  end
end