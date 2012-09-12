require 'spec_helper'

describe SqlExecutor do
  let(:check_id) { "0.1234" }

  describe "#preview_dataset" do
    context "with live data", :database_integration do
      let(:account) { GpdbIntegration.real_gpdb_account }
      let(:database) { GpdbDatabase.find_by_name_and_gpdb_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance) }
      let(:table) { database.find_dataset_in_schema('pg_all_types', 'test_schema') }

      subject { SqlExecutor.preview_dataset(table, account, check_id) }

      it "returns a SqlResult object with the correct rows" do
        subject.rows.should == [[
                                    "(1,2)",
                                    "1.2",
                                    "{1,2,3}",
                                    "1",
                                    "1",
                                    "10101",
                                    "101",
                                    "t",
                                    "(2,2),(1,1)",
                                    "xDEADBEEF",
                                    "var char",
                                    "char      ",
                                    "192.168.100.128/25",
                                    "<(1,2),3>",
                                    "2011-01-01",
                                    "10.01",
                                    "192.168.100.128",
                                    "10",
                                    "3 days 04:05:06",
                                    "[(1,1),(2,2)]",
                                    "08:00:2b:01:02:03",
                                    "$1,000.00",
                                    "0.02000",
                                    "[(1,1),(2,2),(3,3)]",
                                    "(0,0)",
                                    "((10,10),(20,20),(30,30))",
                                    "1.1",
                                    "1",
                                    "2",
                                    "text",
                                    "04:05:06",
                                    "01:02:03-08",
                                    "1999-01-08 04:05:06",
                                    "1999-01-08 04:05:06-08"
                                ]]
      end

      it "gives each column the right 'name' attribute" do
        subject.columns.map(&:name).should == %w{
        t_composite
        t_decimal
        t_array
        t_bigint
        t_bigserial
        t_bit
        t_varbit
        t_bool
        t_box
        t_bytea
        t_varchar
        t_char
        t_cidr
        t_circle
        t_date
        t_double
        t_inet
        t_integer
        t_interval
        t_lseg
        t_macaddr
        t_money
        t_numeric
        t_path
        t_point
        t_polygon
        t_real
        t_smallint
        t_serial
        t_text
        t_time_without_time_zone
        t_time_with_time_zone
        t_timestamp_without_time_zone
        t_timestamp_with_time_zone
      }
      end

      it "gives each column the right 'data_type' attribute" do
        subject.columns.map(&:data_type).should == %w{
          complex
          numeric
          _int4
          int8
          bigserial
          bit
          varbit
          bool
          box
          bytea
          varchar
          bpchar
          cidr
          circle
          date
          float8
          inet
          int4
          interval
          lseg
          macaddr
          money
          numeric
          path
          point
          polygon
          float4
          int2
          serial
          text
          time
          timetz
          timestamp
          timestamptz
      }
      end
    end

    context "without live data" do
      it "limits the preview to 100 rows" do
        mock(SqlExecutor).execute_sql(anything, anything, anything, anything, :limit => 100)
        SqlExecutor.preview_dataset(Dataset.first, Object.new, Object.new)
      end
    end
  end

  describe "#execute_sql", :database_integration do
    let(:account) { instance_accounts(:chorus_gpdb42_test_superuser) }
    let(:schema) { GpdbSchema.find_by_name!('test_schema') }
    let(:sql) { 'select 1' }
    let(:check_id) { '42' }

    it "returns a SqlResult" do
      result = SqlExecutor.execute_sql(schema, account, check_id, sql)
      result.should be_a SqlResult
    end

    it "sets the schema on the SqlResult" do
      result = SqlExecutor.execute_sql(schema, account, check_id, sql)
      result.schema.should == schema
    end

    it "passes the limit to CancelableQuery" do
      called = false
      any_instance_of(CancelableQuery) do |query|
        called = true
        mock.proxy(query).execute(sql, :limit => 42)
      end
      result = SqlExecutor.execute_sql(schema, account, check_id, sql, :limit => 42)
    end
  end

  describe "#cancel_query" do
    it "cancels the query" do
      fake_connection = Object.new
      fake_query = Object.new
      connection_provider = Object.new
      account = Object.new

      mock(connection_provider).with_gpdb_connection(account).yields(fake_connection)
      mock(CancelableQuery).new(fake_connection, check_id) { fake_query }
      mock(fake_query).cancel

      SqlExecutor.cancel_query(connection_provider, account, check_id)
    end
  end
end
