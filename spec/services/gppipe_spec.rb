require 'spec_helper'

describe Gppipe do
  let(:gpdb1) do
    ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb42",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql")
  end

  let(:gpdb2) do
    ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb41",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql")
  end

  after :each do
    gpdb1.try(:disconnect!)
    gpdb2.try(:disconnect!)
  end

  let(:src_conn) {  }
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
      gpdb1.exec_query("drop schema if exists \"#{src_schema}\" cascade;")
      gpdb1.exec_query("create schema \"#{src_schema}\";")

      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}#{table_def};")
      gpdb1.exec_query("insert into #{gp_pipe.src_fullname}(id, name) values (1, 'marsbar');")

      gpdb2.exec_query("drop schema if exists \"#{dst_schema}\" cascade;")
      gpdb2.exec_query("create schema \"#{dst_schema}\";")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    it "should move data from candy to dst_candy" do
      gp_pipe.run

      gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
    end

    context "a sql query blocks forever" do
      before do
        stub(Gppipe).timeout_seconds { 1 }
        stub(gp_pipe.src_conn).exec_query { puts "stub sleep"; sleep(10); raise Exception, "test failed - no timeout" }
      end

      it "times out the query and raises a Timeout exception" do
        expect { gp_pipe.run }.to raise_exception(Timeout::Error)
      end
    end

    context "destination table already exists" do
      before do
        gpdb2.exec_query("CREATE TABLE #{gp_pipe.dst_fullname}#{table_def}")
      end

      it "cleans up on an exception (in this case the dst table exists already)" do
        expect { gp_pipe.run }.to raise_exception
        count_result = gpdb1.exec_query("select count(*) from pg_tables where schemaname = '#{src_schema}' and tablename = '#{gp_pipe.pipe_name}';")
        count_result[0]['count'].should == 0
        count_result = gpdb2.exec_query("select count(*) from pg_tables where schemaname = '#{dst_schema}' and tablename = '#{gp_pipe.pipe_name}';")
        count_result[0]['count'].should == 0
      end
    end

    context "tables and schemas have weird characters" do
      let(:src_table) { "2candy" }
      let(:src_schema) { "2new_schema" }
      let(:dst_table) { "2dst_candy" }
      let(:dst_schema) { "2new_schema" }

      it "single quotes table and schema names if they have weird chars" do
        gp_pipe.run

        gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
      end
    end
  end

  context "when the source table is empty" do
    before do
      gpdb1.exec_query("drop table if exists new_schema.#{src_table};")
      gpdb1.exec_query("create table new_schema.#{src_table}#{table_def};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end


    it "simply creates the dst table if the source table is empty (no gpfdist used)" do
      gp_pipe.run

      gpdb2.exec_query("SELECT * FROM #{dst_schema}.#{dst_table}").length.should == 0
    end
  end

  it "has configurable gpfdist/gpfdists"

  it "does not use special characters in the pipe names" do
    gppipe = Gppipe.new("#%)", "$%*@$", "$%*", "@@")
    gppipe.pipe_name.should_not match(/[^A-Za-z0-9_]/)
  end
end