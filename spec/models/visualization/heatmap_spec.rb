require 'spec_helper'

describe Visualization::Heatmap do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'public') }
  let(:dataset) { FactoryGirl.build_stubbed(:gpdb_table, :name => '1000_songs_test_1', :schema => schema) }
  let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }
  let(:relation) { %Q{"#{schema.name}"."#{dataset.name}"} }

  before do
    any_instance_of(Visualization::Heatmap) do |instance|
      stub(instance).fetch_min_max do
        return 9.0, 1.0, 10.0, 1.0
      end
    end
  end

  describe "#build_sql" do
    context "no filters" do
      let(:attributes) do
        {
          :x_bins => 20,
          :y_bins => 10,
          :x_axis => 'theme',
          :y_axis => 'artist'
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        visualization.build_min_max_sql.should == "SELECT max('theme') AS maxX, min('theme') AS minX, max('artist') AS maxY, min('artist') AS minY FROM #{relation} "

        column_information = %Q{"information_schema"."columns"}
        visualization.build_column_sql.should == "SELECT #{column_information}.\"column_name\" AS name, #{column_information}.\"data_type\" AS type_category FROM #{column_information}  WHERE #{column_information}.\"table_name\" = '1000_songs_test_1' AND #{column_information}.\"table_schema\" = 'public' AND #{column_information}.\"column_name\" IN ('theme', 'artist')"

        visualization.build_row_sql.should == "SELECT *, count(*) AS value FROM ( SELECT width_bucket( CAST(\"theme\" AS numeric), CAST(1.0 AS numeric), CAST(9.0 AS numeric), 4) AS xbin, width_bucket( CAST(\"artist\" AS numeric), CAST(1.0 AS numeric), CAST(10.0 AS numeric), 6) AS ybin FROM ( SELECT * FROM \"public\".\"1000_songs_test_1\") AS subquery WHERE \"theme\" IS NOT NULL AND \"artist\" IS NOT NULL) AS foo GROUP BY xbin, ybin"
      end
    end

    #   context "with one filter" do
    #     let(:attributes) do
    #       {
    #           :bins => 20,
    #           :y_axis => 'artist',
    #           :filters => ['"1000_songs_test_1"."year" < 1980']
    #       }
    #     end

    #     it "creates the SQL based on the grouping and bins" do
    #       visualization = described_class.new(dataset, attributes)
    #       visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
    #           'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 GROUP BY ' +
    #           '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
    #     end
    #   end

    #   context "with more than one filter" do
    #     let(:attributes) do
    #       {
    #           :bins => 20,
    #           :y_axis => 'artist',
    #           :filters => ['"1000_songs_test_1"."year" < 1980', '"1000_songs_test_1"."year" > 1950']
    #       }
    #     end

    #     it "creates the SQL based on the grouping and bins" do
    #       visualization = described_class.new(dataset, attributes)
    #       visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
    #           'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 AND "1000_songs_test_1"."year" > 1950 GROUP BY ' +
    #           '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
    #     end
    #   end
  end

  describe "#fetch!" do
    before do
      call_count = 0
      mock(schema).with_gpdb_connection(instance_account).times(2) do
        r = [
            [
                {'name' => 'x', 'typeCategory' => 'integer'},
                {'name' => 'y', 'typeCategory' => 'integer'},
                {'name' => 'value', 'typeCategory' => 'integer'},
                {'name' => 'xLabel', 'typeCategory' => 'text'},
                {'name' => 'yLabel', 'typeCategory' => 'text'}
            ],
            [
              {'value' => '9', 'x' => '1', 'xLabel' => [1, 3], 'y' => '1', 'yLabel' => [1, 1.2]},
              {'value' => '2', 'x' => '3', 'xLabel' => [1, 5], 'y' => '2', 'yLabel' => [3, 1.3]}
            ]][call_count]
        call_count = call_count + 1
        r
      end
    end

    let(:attributes) do
      {
          :x_bins => 1,
          :y_bins => 2,
          :x_axis => 'theme',
          :y_axis => 'artist'
      }
    end

    it "returns visualization structure" do
      visualization = described_class.new(dataset, attributes)
      visualization.fetch!(instance_account)

      visualization.rows.should include({'value' => '9', 'x' => '1', 'xLabel' => [1, 3], 'y' => '1', 'yLabel' => [1, 1.2]})
      visualization.rows.should include({'value' => '2', 'x' => '3', 'xLabel' => [1, 5], 'y' => '2', 'yLabel' => [3, 1.3]})
    end

    it "interpolates missing rows" do

    end
  end
end
