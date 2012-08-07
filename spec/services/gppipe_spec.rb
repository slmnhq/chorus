require 'spec_helper'

describe Gppipe do

  let(:src_table) { "candy" }
  let(:src_schema) { "new_schema" }
  let(:dest_table) { "dest_candy" }
  let(:dest_schema) { "new_schema" }
  let(:gp_pipe) { Gppipe.new(src_schema, src_table, dest_schema, dest_table) }

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

  context "actually running the query" do
    before do
      gp_pipe.gpdb1 do |conn|
        conn.exec_query("drop table if exists new_schema.#{src_table};")
        conn.exec_query("create table new_schema.#{src_table}(id integer, name text);")
        conn.exec_query("insert into new_schema.#{src_table}(id, name) values (1, 'marsbar');")
      end
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists new_schema.#{dest_table};") }
    end

    after do
      gp_pipe.gpdb1 { |conn| conn.exec_query("drop table if exists new_schema.#{src_table};") }
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists new_schema.#{dest_table};") }
    end

    it "should move data from candy to dest_candy" do
      gp_pipe.run

      gp_pipe.gpdb2 do |conn|
        conn.exec_query("SELECT * FROM new_schema.#{dest_table}").length.should == 1
      end
    end
  end

  context "when the source table is empty" do
    before do
      gp_pipe.gpdb1 do |conn|
        conn.exec_query("drop table if exists new_schema.#{src_table};")
        conn.exec_query("create table new_schema.#{src_table}(id integer, name text);")
      end
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists new_schema.#{dest_table};") }
    end

    after do
      gp_pipe.gpdb1 { |conn| conn.exec_query("drop table if exists new_schema.#{src_table};") }
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists new_schema.#{dest_table};") }
    end


    it "simply creates the dest table if the source table is empty (no gpfdist used)" do
      gp_pipe.run

      gp_pipe.gpdb2 do |conn|
        conn.exec_query("SELECT * FROM new_schema.#{dest_table}").length.should == 0
      end
    end
  end

  it "has configurable gpfdist/gpfdists"

  it "does not use special characters in the pipe names" do
    gppipe = Gppipe.new("#%)", "$%*@$", "$%*", "@@")
    gppipe.pipe_name.should_not match(/[^A-Za-z0-9_]/)
  end

  it "checks the destination table does not already exist"
  it "has a reasonable timeout on both insert and select sides of pipe"
  it "single quotes table and schema names if they have weird chars"
end