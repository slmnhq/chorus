require 'spec_helper'

describe SqlResults, :type => :database_integration do
  let(:account) { real_gpdb_account }
  let(:table) { GpdbTable.find_by_name("pg_all_types") }
  let(:check_id) { "0.1234" }

  before do
    refresh_chorus
  end

  describe "#rows" do
    subject { SqlResults.preview_dataset(table, account, check_id).rows }

    it "includes one item for each row in the table" do
      subject.size.should == 1
    end

    it "represents values as strings" do
      subject.first.map(&:as_json).should == [
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
      ]
    end
  end

  describe "#columns" do
    subject { SqlResults.preview_dataset(table, account, check_id).columns }

    it "gives each column the right 'name' attribute" do
      subject.map(&:name).should == [
        "t_composite",
        "t_decimal",
        "t_array",
        "t_bigint",
        "t_bigserial",
        "t_bit",
        "t_varbit",
        "t_bool",
        "t_box",
        "t_bytea",
        "t_varchar",
        "t_char",
        "t_cidr",
        "t_circle",
        "t_date",
        "t_double",
        "t_inet",
        "t_integer",
        "t_interval",
        "t_lseg",
        "t_macaddr",
        "t_money",
        "t_numeric",
        "t_path",
        "t_point",
        "t_polygon",
        "t_real",
        "t_smallint",
        "t_serial",
        "t_text",
        "t_time_without_time_zone",
        "t_time_with_time_zone",
        "t_timestamp_without_time_zone",
        "t_timestamp_with_time_zone"
      ]
    end

    it "gives each column the right 'data_type' attribute" do
      subject.map(&:data_type).should == [
        "complex",
        "numeric",
        "integer[]",
        "bigint",
        "bigint",
        "bit(5)",
        "bit varying(10)",
        "boolean",
        "box",
        "bytea",
        "character varying(10)",
        "character(10)",
        "cidr",
        "circle",
        "date",
        "double precision",
        "inet",
        "integer",
        "interval",
        "lseg",
        "macaddr",
        "money",
        "numeric(5,5)",
        "path",
        "point",
        "polygon",
        "real",
        "smallint",
        "integer",
        "text",
        "time without time zone",
        "time with time zone",
        "timestamp without time zone",
        "timestamp with time zone"
      ]
    end
  end
end
