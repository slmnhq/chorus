require 'spec_helper'

describe Gpdb::ConnectionBuilder do
  let(:gpdb_instance) { FactoryGirl::create :gpdb_instance, :host => "hello" }
  let(:instance_account) { FactoryGirl::create :instance_account, :db_username => "user1", :db_password => "pw1111" }
  let(:fake_connection_adapter) { stub(Object.new).disconnect!.subject }

  let(:expected_connection_params) do
    {
      host: gpdb_instance.host,
      port: gpdb_instance.port,
      database: expected_database,
      username: instance_account.db_username,
      password: instance_account.db_password,
      adapter: "jdbcpostgresql"
    }
  end

  let(:expected_database) { gpdb_instance.maintenance_db }

  describe ".connect!" do
    before do
      stub(ActiveRecord::Base).postgresql_connection(expected_connection_params) { fake_connection_adapter }
    end

    context "when connection is successful" do
      context "when a database name is passed" do
        let(:expected_database) { "john_the_database" }

        it "connections to the given database and instance, with the given account" do
          Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account, "john_the_database")
        end
      end

      context "when no database name is passed" do
        it "connects to the given instance's 'maintenance db''" do
          Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account)
        end
      end

      it "calls the given block with the postgres connection" do
        mock(fake_connection_adapter).query("foo")
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account) do |conn|
          conn.query("foo")
        end
      end

      it "returns the result of the block" do
        result = Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account) do |conn|
          "value returned by block"
        end
        result.should == "value returned by block"
      end

      it "disconnects afterward" do
        mock(fake_connection_adapter).disconnect!
        Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account)
      end
    end

    context "when the connection fails" do
      let(:exception1) { ActiveRecord::JDBCError.new }
      let(:fake_connection_adapter) { raise exception1 }
      let(:raised_message) { "#{Time.now.strftime("%Y-%m-%d %H:%M:%S")} ERROR: Failed to establish JDBC connection to #{gpdb_instance.host}:#{gpdb_instance.port}" }

      it "does not catch the error" do
        Timecop.freeze(DateTime.now)
        mock(Rails.logger).error("#{raised_message} - #{exception1.message}")
        expect {
          Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account)
        }.to raise_error(ActiveRecord::JDBCError, "#{raised_message}")
        Timecop.return
      end

      context "when instance has not finished provisioning" do
        let!(:gpdb_instance) { FactoryGirl.create(:gpdb_instance, :state => "provisioning") }

        it "raises an InstanceStillProvisioning exception" do
          expect {
            Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account)
          }.to raise_error(Gpdb::InstanceStillProvisioning)
        end
      end
    end

    context "when the sql command fails" do
      let(:exception1) { ActiveRecord::StatementInvalid.new }
      let(:raised_message) { "#{Time.now.strftime("%Y-%m-%d %H:%M:%S")} ERROR: SQL Statement Invalid" }
      let(:sql_command) { "SELECT * FROM BOGUS_TABLE;" }

      it "does not catch the error" do
        Timecop.freeze(DateTime.now)
        mock(Rails.logger).info("#{raised_message} - #{exception1.message}")
        mock(fake_connection_adapter).query.with_any_args { raise ActiveRecord::StatementInvalid }
        expect {
          Gpdb::ConnectionBuilder.connect!(gpdb_instance, instance_account) do |conn|
            conn.query sql_command
          end
        }.to raise_error(ActiveRecord::StatementInvalid, raised_message)
        Timecop.return
      end
    end
  end
end
