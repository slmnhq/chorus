require 'spec_helper'

describe Visualization::Frequency do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'public') }
  let(:dataset) { FactoryGirl.build_stubbed(:gpdb_table, :name => '1000_songs_test_1', :schema => schema) }
  let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }

  describe "#build_sql" do
    context "no filters" do
      let(:attributes) do
        {
            :bins => 20,
            :y_axis => 'artist'
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
            'FROM "public"."1000_songs_test_1"  GROUP BY "public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
      end
    end

    context "with one filter" do
      let(:attributes) do
        {
            :bins => 20,
            :y_axis => 'artist',
            :filters => ['"1000_songs_test_1"."year" < 1980']
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
            'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 GROUP BY ' +
            '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
      end
    end

    context "with more than one filter" do
      let(:attributes) do
        {
            :bins => 20,
            :y_axis => 'artist',
            :filters => ['"1000_songs_test_1"."year" < 1980', '"1000_songs_test_1"."year" > 1950']
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        visualization.build_row_sql.should == 'SELECT  "public"."1000_songs_test_1"."artist" AS bucket, count(1) AS count ' +
            'FROM "public"."1000_songs_test_1"  WHERE "1000_songs_test_1"."year" < 1980 AND "1000_songs_test_1"."year" > 1950 GROUP BY ' +
            '"public"."1000_songs_test_1"."artist" ORDER BY count DESC LIMIT 20'
      end
    end
  end

  describe "#fetch!" do
    before do
      call_count = 0
      mock(schema).with_gpdb_connection(instance_account).times(2) do
        r = [
            [
                {'name' => 'bucket', 'typeCategory' => 'text'},
                {'name' => 'count', 'typeCategory' => 'integer'}
            ],
            [
                {'count' => 19, 'bucket' => 'The Beatles'},
                {'count' => 24, 'bucket' => 'Bob Dylan'},
                {'count' => 9, 'bucket' => 'David Bowie'}
            ]][call_count]
        call_count = call_count + 1
        r
      end
    end

    let(:attributes) do
      {
          :bins => 3,
          :y_axis => 'artist'
      }
    end

    it "returns visualization structure" do
      visualization = described_class.new(dataset, attributes)
      visualization.fetch!(instance_account)

      visualization.rows.should include({'count' => 19, 'bucket' => 'The Beatles'})
      visualization.rows.should include({'count' => 24, 'bucket' => 'Bob Dylan'})
      visualization.rows.should include({'count' => 9, 'bucket' => 'David Bowie'})
    end
  end
end
