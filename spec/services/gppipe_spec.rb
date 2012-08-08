require 'spec_helper'

describe Gppipe do

  let(:src_table) { "candy" }
  let(:src_schema) { "new_schema" }
  let(:dst_table) { "dst_candy" }
  let(:dst_schema) { "new_schema" }
  let(:table_def) { "(id integer, name text)" }
  let(:gp_pipe) { Gppipe.new(src_schema, src_table, dst_schema, dst_table) }

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
        conn.exec_query("drop schema if exists \"#{src_schema}\" cascade;")
        conn.exec_query("create schema \"#{src_schema}\";")

        conn.exec_query("drop table if exists #{gp_pipe.src_fullname};")
        conn.exec_query("create table #{gp_pipe.src_fullname}#{table_def};")
        conn.exec_query("insert into #{gp_pipe.src_fullname}(id, name) values (1, 'marsbar');")

      end
      gp_pipe.gpdb2 do |conn|
        conn.exec_query("drop schema if exists \"#{dst_schema}\" cascade;")
        conn.exec_query("create schema \"#{dst_schema}\";")

        conn.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
      end
    end

    after do
      gp_pipe.gpdb1 { |conn| conn.exec_query("drop table if exists #{gp_pipe.src_fullname};") }
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists #{gp_pipe.dst_fullname};") }
    end

    it "should move data from candy to dst_candy" do
      gp_pipe.run

      gp_pipe.gpdb2 do |conn|
        conn.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
      end
    end

    context "destination table already exists" do
      before do
        gp_pipe.gpdb2 do |conn|
          conn.exec_query("CREATE TABLE #{gp_pipe.dst_fullname}#{table_def}")
        end
      end

      it "cleans up on an exception (in this case the dst table exists already)" do
        expect { gp_pipe.run }.to raise_exception
        gp_pipe.gpdb1 do |conn|
          count_result = conn.exec_query("select count(*) from pg_tables where schemaname = '#{src_schema}' and tablename = '#{gp_pipe.pipe_name}';")
          count_result[0]['count'].should == 0
        end
        gp_pipe.gpdb2 do |conn|
          count_result = conn.exec_query("select count(*) from pg_tables where schemaname = '#{dst_schema}' and tablename = '#{gp_pipe.pipe_name}';")
          count_result[0]['count'].should == 0
        end
      end
    end

    context "tables and schemas have weird characters" do
      let(:src_table) { "2candy" }
      let(:src_schema) { "2new_schema" }
      let(:dst_table) { "2dst_candy" }
      let(:dst_schema) { "2new_schema" }

      it "single quotes table and schema names if they have weird chars" do
        gp_pipe.run

        gp_pipe.gpdb2 do |conn|
          conn.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
        end
      end
    end
  end

  context "when the source table is empty" do
    before do
      gp_pipe.gpdb1 do |conn|
        conn.exec_query("drop table if exists new_schema.#{src_table};")
        conn.exec_query("create table new_schema.#{src_table}#{table_def};")
      end
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists #{gp_pipe.dst_fullname};") }
    end

    after do
      gp_pipe.gpdb1 { |conn| conn.exec_query("drop table if exists #{gp_pipe.src_fullname};") }
      gp_pipe.gpdb2 { |conn| conn.exec_query("drop table if exists #{gp_pipe.dst_fullname};") }
    end


    it "simply creates the dst table if the source table is empty (no gpfdist used)" do
      gp_pipe.run

      gp_pipe.gpdb2 do |conn|
        conn.exec_query("SELECT * FROM #{dst_schema}.#{dst_table}").length.should == 0
      end
    end
  end

  it "has configurable gpfdist/gpfdists"

  it "does not use special characters in the pipe names" do
    gppipe = Gppipe.new("#%)", "$%*@$", "$%*", "@@")
    gppipe.pipe_name.should_not match(/[^A-Za-z0-9_]/)
  end

  it "has a reasonable timeout on both insert and select sides of pipe"
end