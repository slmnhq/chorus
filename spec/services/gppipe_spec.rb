require 'spec_helper'

describe Gppipe, :database_integration => true do
  before do
    refresh_chorus
    stub(Gppipe).gpfdist_url { Socket.gethostname }
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
    # We call src_schema from the test, although it is only called from run outside of tests, so we need to clean up
    gp_pipe.src_conn.try(:disconnect!)
    gp_pipe.dst_conn.try(:disconnect!)
  end

  let(:src_table) { "candy" }
  let(:dst_table) { "dst_candy" }
  let(:table_def) { '"id" integer, "name" text, "id2" integer, "id3" integer, PRIMARY KEY("id2", "id3", "id")' }
  let(:distrib_def) { "" }
  let(:gp_pipe) { Gppipe.new(schema, src_table, schema, dst_table, user) }

  it 'uses gpfdist if the gpfdist.ssl configuration is false (no in the test environment)' do
    Gppipe.protocol.should == 'gpfdist'
  end

  it "has an empty limit clause for no limit passed" do
    pipe = Gppipe.new(schema, src_table, schema, dst_table, user)
    pipe.limit_clause.should == ''
  end

  it "has a LIMIT 500 for row_limit = 500" do
    pipe = Gppipe.new(schema, src_table, schema, dst_table, user, 500)
    pipe.limit_clause.should == 'LIMIT 500'
  end

  context "for a table with 0 columns" do
    let(:table_def) { '' }
    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}(#{table_def}) #{distrib_def};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
    end

    it "should have the correct table definition" do
      gp_pipe.table_definition.should == table_def
    end

    it "should have the correct table definition with keys" do
      gp_pipe.table_definition_with_keys.should == table_def
    end
  end

  context "for a table with 1 column and no primary key, distributed randomly" do
    let(:table_def) { '"2id" integer' }

    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}(#{table_def}) DISTRIBUTED RANDOMLY;")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
    end

    it "should have the correct table definition" do
      gp_pipe.table_definition.should == table_def
    end

    it "should have the correct table definition with keys" do
      gp_pipe.table_definition_with_keys.should == table_def
    end

    it "should have DISTRIBUTED RANDOMLY for its distribution key clause" do
      gp_pipe.distribution_key_clause.should == "DISTRIBUTED RANDOMLY"
    end
  end

  context "for a table with a composite primary key" do
    let(:table_def) { '"id" integer, "id2" integer, PRIMARY KEY("id", "id2")' }

    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}(#{table_def});")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
    end

    it "should have the correct table definition with keys" do
      gp_pipe.table_definition_with_keys.should == table_def
    end
  end


  context "actually running the query" do
    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}(#{table_def});")
      gpdb1.exec_query("insert into #{gp_pipe.src_fullname}(id, name, id2, id3) values (1, 'marsbar', 3, 5);")
      gpdb1.exec_query("insert into #{gp_pipe.src_fullname}(id, name, id2, id3) values (2, 'kitkat', 4, 6);")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    after do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb2.exec_query("drop table if exists #{gp_pipe.dst_fullname};")
    end

    it "has the correct DDL for create table" do
      gp_pipe.table_definition_with_keys.should == table_def
    end

    context ".run_new" do
      it "creates a new pipe and runs it" do
        Gppipe.run_new(schema.id, src_table, schema.id, dst_table, user.id)
        gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 2
      end
    end

    context "with distribution key" do
      let(:distrib_def) { 'DISTRIBUTED BY("id2", "id3")' }

      it "should move data from candy to dst_candy and have the correct primary key and distribution key" do
        gp_pipe.run

        gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 2

        primary_key_sql = <<-PRIMARYKEYSQL
          SELECT attname
          FROM   (SELECT *, generate_series(1, array_upper(a, 1)) AS rn
          FROM  (SELECT conkey AS a
          FROM   pg_constraint where conrelid = '#{schema.name}.#{dst_table}'::regclass and contype='p'
          ) x
          ) y, pg_attribute WHERE attrelid = '#{schema.name}.#{dst_table}'::regclass::oid AND a[rn] = attnum ORDER by rn;
        PRIMARYKEYSQL

        gpdb2.exec_query(primary_key_sql)[0]['attname'].should == 'id2'
        gpdb2.exec_query(primary_key_sql)[1]['attname'].should == 'id3'
        gpdb2.exec_query(primary_key_sql)[2]['attname'].should == 'id'

        distribution_key_sql = <<-DISTRIBUTION_KEY_SQL
          SELECT attname
          FROM   (SELECT *, generate_series(1, array_upper(a, 1)) AS rn
          FROM  (SELECT attrnums AS a
          FROM   gp_distribution_policy where localoid = '#{schema.name}.#{dst_table}'::regclass
          ) x
          ) y, pg_attribute WHERE attrelid = '#{schema.name}.#{dst_table}'::regclass::oid AND a[rn] = attnum ORDER by rn;
        DISTRIBUTION_KEY_SQL

        # defaults to the first one
        gpdb2.exec_query(distribution_key_sql)[0]['attname'].should == 'id2'
        gpdb2.exec_query(distribution_key_sql)[1]['attname'].should == 'id3'
      end
    end

    context "limiting the number of rows" do
      let(:row_limit) { 1 }
      let(:gp_pipe) { Gppipe.new(schema, src_table, schema, dst_table, user, row_limit) }

      it "should only have the first row" do
        gp_pipe.run

        rows = gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}")
        rows.length.should == 1
      end

      context "with a row limit of 0" do
        let(:row_limit) { 0 }

        it "doesn't hang gpfdist, by treating the source like an empty table" do
          stub(Gppipe).timeout_seconds { 10 }
          Timeout::timeout(5) do
            gp_pipe.run
          end

          gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 0
        end
      end
    end

    context "a sql query blocks forever" do
      before do
        stub(Gppipe).timeout_seconds { 1 }
        stub(gp_pipe.src_conn).exec_query { sleep(10); raise Exception, "test failed - no timeout" }
      end

      it "times out the query and raises a Timeout exception" do
        expect { gp_pipe.run }.to raise_exception(Timeout::Error)
      end
    end

    context "destination table already exists" do
      before do
        gpdb2.exec_query("CREATE TABLE #{gp_pipe.dst_fullname}(#{table_def})")
      end

      it "cleans up on an exception (in this case the dst table exists already)" do
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

      it "single quotes table and schema names if they have weird chars" do
        gp_pipe.run

        gpdb2.exec_query("SELECT * FROM #{gp_pipe.dst_fullname}").length.should == 2
      end
    end
  end

  context "when the source table is empty" do
    before do
      gpdb1.exec_query("drop table if exists #{gp_pipe.src_fullname};")
      gpdb1.exec_query("create table #{gp_pipe.src_fullname}(#{table_def});")
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

  it "does not use special characters in the pipe names" do
    gppipe = Gppipe.new(schema, "$%*@$", schema, "@@", user)
    gppipe.pipe_name.should_not match(/[^A-Za-z0-9_]/)
  end
end