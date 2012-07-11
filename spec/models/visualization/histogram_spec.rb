require 'spec_helper'

describe Visualization::Histogram do
  let(:schema) { FactoryGirl.build_stubbed(:gpdb_schema, :name => 'analytics') }
    let(:dataset) { FactoryGirl.build_stubbed(:gpdb_table, :name => '2009_sfo_customer_survey', :schema => schema) }
    let(:instance_account) { FactoryGirl.build_stubbed(:instance_account) }

    describe "#build_sql" do
      context "no filters" do
        let(:attributes) do
          {
              :bins => 20,
              :x_axis => 'airport_cleanliness'
          }
        end

        it "creates the SQL to get min and max values" do
            visualization = described_class.new(dataset, attributes)
            db_name = '"analytics"."2009_sfo_customer_survey"'
            category = db_name + '."airport_cleanliness"'
            visualization.build_min_max_sql.should == 'SELECT MIN(' + category + ') AS min, MAX(' + category + ') AS max FROM ' + db_name + ' '
        end

        it "creates the SQL based on the grouping and bins" do
          visualization = described_class.new(dataset, attributes)
          db_name = '"analytics"."2009_sfo_customer_survey"'
          category = db_name + '."airport_cleanliness"'
          width_bucket = 'width_bucket(CAST('+ category +' as numeric), CAST(1.0 as numeric), CAST(9.0 as numeric), 20)'

          visualization.instance_variable_set(:@min, "1.0")
          visualization.instance_variable_set(:@max, "9.0")
          visualization.build_row_sql.should == 'SELECT '+ width_bucket +' AS bucket, ' +
              'COUNT('+ width_bucket +') AS frequency FROM '+ db_name +
              '  WHERE '+ category +' IS NOT NULL GROUP BY '+ width_bucket
        end

        it "creates the SQL for columns" do
          visualization = described_class.new(dataset, attributes)
          db_name = '"analytics"."2009_sfo_customer_survey"'
          category = db_name + '."airport_cleanliness"'
          visualization.build_min_max_sql.should == 'SELECT MIN(' + category + ') AS min, MAX(' + category + ') AS max FROM ' + db_name + ' '
        end
      end

    context "with one filter" do
      let(:attributes) do
        {
            :bins => 20,
            :x_axis => 'airport_cleanliness',
            :filters => ['"2009_sfo_customer_survey".terminal = \'3\'']
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        db_name = '"analytics"."2009_sfo_customer_survey"'
        category = db_name + '."airport_cleanliness"'
        width_bucket = 'width_bucket(CAST('+ category +' as numeric), CAST(1.0 as numeric), CAST(9.0 as numeric), 20)'

        visualization.instance_variable_set(:@min, "1.0")
        visualization.instance_variable_set(:@max, "9.0")
        visualization.build_row_sql.should == 'SELECT '+ width_bucket +' AS bucket, ' +
            'COUNT('+ width_bucket +') AS frequency FROM '+ db_name +
            '  WHERE '+ category +' IS NOT NULL AND "2009_sfo_customer_survey".terminal = \'3\' GROUP BY '+ width_bucket
      end
    end

    context "with more than one filter" do
      let(:attributes) do
        {
            :bins => 20,
            :x_axis => 'airport_cleanliness',
            :filters => ['"2009_sfo_customer_survey".terminal = \'3\'', '"2009_sfo_customer_survey".airline = \'UNITED\'']
        }
      end

      it "creates the SQL based on the grouping and bins" do
        visualization = described_class.new(dataset, attributes)
        db_name = '"analytics"."2009_sfo_customer_survey"'
        category = db_name + '."airport_cleanliness"'
        width_bucket = 'width_bucket(CAST('+ category +' as numeric), CAST(1.0 as numeric), CAST(9.0 as numeric), 20)'

        visualization.instance_variable_set(:@min, "1.0")
        visualization.instance_variable_set(:@max, "9.0")
        visualization.build_row_sql.should == 'SELECT '+ width_bucket +' AS bucket, ' +
            'COUNT('+ width_bucket +') AS frequency FROM '+ db_name +
            '  WHERE '+ category +' IS NOT NULL AND "2009_sfo_customer_survey".terminal = \'3\' AND "2009_sfo_customer_survey".airline = \'UNITED\' GROUP BY '+ width_bucket
      end
    end
  end

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
      visualization.rows.should include({:bin => [3.7,  6.3], :frequency => 0})
      visualization.rows.should include({:bin => [6.3, 9.0], :frequency => 15})
    end
  end
end