require 'spec_helper'

describe Gppipe do

  let(:src_table) { "candy" }
  let(:dest_table) { "dest_candy" }
  let(:gp_pipe) { Gppipe.new(src_table,dest_table) }


  it "should create a tabledef from an information_schema query" do
    result = [{"column_name"=>"id", "data_type"=>"integer"}, {"column_name"=>"name", "data_type"=>"text"}]
    gp_pipe.tabledef_from_query(result).should == "id integer, name text"
  end

  it "should create a tabledef from an information_schema query with 1 column" do
    result = [{"column_name"=>"id", "data_type"=>"integer"}]
    gp_pipe.tabledef_from_query(result).should == "id integer"
  end

  it "should create a tabledef from an information_schema query with 0 columns" do
    result = []
    gp_pipe.tabledef_from_query(result).should == ""
  end

  it "should move data from candy to dest_candy" do
    gp_pipe.gpdb1 do |conn|
    end

    gp_pipe.gpdb2 do |conn|
      conn.exec_query("drop table if exists new_schema.#{dest_table};")
    end

    gp_pipe.run

    gp_pipe.gpdb2 do |conn|
      conn.exec_query("SELECT * FROM new_schema.#{dest_table}").length.should == 2
    end
  end
end