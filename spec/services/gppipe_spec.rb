require 'spec_helper'

describe Gppipe, :database_integration => true do
  before do
    refresh_chorus
  end

  # In the test, use gpfdist to move data between tables in the same schema and database
  let(:instance_account1) { GpdbIntegration.real_gpdb_account }
  let(:user) { instance_account1.owner }
  let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
  let(:schema) { database.schemas.find_by_name('test_schema') }

  let(:gpdb1) do
    ActiveRecord::Base.postgresql_connection(
        :host => instance_account1.instance.host,
        :port => instance_account1.instance.port,
        :database => schema.database.name,
        :username => instance_account1.db_username,
        :password => instance_account1.db_password,
        :adapter => "jdbcpostgresql")
  end

  let(:gpdb2) do
    ActiveRecord::Base.postgresql_connection(
        :host => instance_account1.instance.host,
        :port => instance_account1.instance.port,
        :database => schema.database.name,
        :username => instance_account1.db_username,
        :password => instance_account1.db_password,
        :adapter => "jdbcpostgresql")
  end

  after :each do
    gpdb1.try(:disconnect!)
    gpdb2.try(:disconnect!)
  end

  let(:src_table) { "candy" }
  let(:dst_table) { "dst_candy" }
  let(:table_def) { "(id integer, name text)" }
  let(:gp_pipe) { Gppipe.new(schema, src_table, schema, dst_table, user) }

  it "should create a tabledef from an information_schema query" do
    result = [{"column_name"=>"id", "data_type"=>"integer"}, {"column_name"=>"name", "data_type"=>"text"}]
    gp_pipe.tabledef_from_query(result).should == '"id" integer, "name" text'
  end

  it "should create a tabledef from an information_schema query with 1 column" do
    result = [{"column_name"=>"id", "data_type"=>"integer"}]
    gp_pipe.tabledef_from_query(result).should == '"id" integer'
  end

  it "should create a tabledef from an information_schema query with 0 columns" do
    result = []
    gp_pipe.tabledef_from_query(result).should == ""
  end

  context "actually running the query" do
    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}#{table_def};")
      gpdb1.exec_query("insert into #{gp_pipe.src_fullname}(id, name) values (1, 'marsbar');")

      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    xit "should move data from candy to dst_candy" do
      gp_pipe.run

      gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
    end

    context "a sql query blocks forever" do
      before do
        stub(Gppipe).timeout_seconds { 1 }
        stub(gp_pipe.src_conn).exec_query { sleep(10); raise Exception, "test failed - no timeout" }
      end

      xit "times out the query and raises a Timeout exception" do
        expect { gp_pipe.run }.to raise_exception(Timeout::Error)
      end
    end

    context "destination table already exists" do
      before do
        gpdb2.exec_query("CREATE TABLE #{gp_pipe.dst_fullname}#{table_def}")
      end

      xit "cleans up on an exception (in this case the dst table exists already)" do
        expect { gp_pipe.run }.to raise_exception
        count_result = gpdb1.exec_query("select count(*) from pg_tables where schemaname = '#{schema.name}' and tablename = '#{gp_pipe.pipe_name}';")
        count_result[0]['count'].should == 0
        count_result = gpdb2.exec_query("select count(*) from pg_tables where schemaname = '#{schema.name}' and tablename = '#{gp_pipe.pipe_name}';")
        count_result[0]['count'].should == 0
      end
    end

    context "tables have weird characters" do
      let(:src_table) { "2candy" }
      let(:dst_table) { "2dst_candy" }

      xit "single quotes table and schema names if they have weird chars" do
        gp_pipe.run

        gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 1
      end
    end
  end

  context "when the source table is empty" do
    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}#{table_def};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end


    it "simply creates the dst table if the source table is empty (no gpfdist used)" do
      gp_pipe.run

      gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 0
    end
  end

  it "has configurable gpfdist/gpfdists"

  it "does not use special characters in the pipe names" do
    gppipe = Gppipe.new(schema, "$%*@$", schema, "@@", user)
    gppipe.pipe_name.should_not match(/[^A-Za-z0-9_]/)
  end
end