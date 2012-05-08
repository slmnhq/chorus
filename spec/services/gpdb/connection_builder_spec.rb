require 'spec_helper'

describe Gpdb::ConnectionBuilder do
  let(:owner) { FactoryGirl.create(:user) }
  let(:valid_input_attributes) do
    {
      :name => "new",
      :port => 12345,
      :host => "server.emc.com",
      :maintenance_db => "postgres",
      :db_username => "bob",
      :db_password => "secret",
      :provision_type => "register",
      :description => "old description"
    }
  end
  let(:valid_output_attributes) do
    {
      :name => "new",
      :port => 12345,
      :host => "server.emc.com",
      :maintenance_db => "postgres",
      :username => "bob",
      :password => "secret",
      :provision_type => "register",
      :description => "old description"
    }

  end

  before do
    stub(ActiveRecord::Base).postgresql_connection { valid_output_attributes }
  end

  describe ".create!" do
    it "requires name" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_input_attributes.merge(:name => nil), owner)
      }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it "requires db connection params" do
      [:host, :port, :maintenance_db].each do |attribute|
        expect {
          Gpdb::ConnectionBuilder.create!(valid_input_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires db username and password" do
      [:db_username, :db_password].each do |attribute|
        expect {
          Gpdb::ConnectionBuilder.create!(valid_input_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires that a real connection to GPDB can be established" do
      stub(ActiveRecord::Base).postgresql_connection { raise(PG::Error.new("connection error")) }
      lambda { Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner) }.should raise_error

      begin
        Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.get(:connection).should == [[:generic, {:message => "connection error"}]]
      end
    end

    it "caches the db name, owner and connection params" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      }.to change { Instance.count }.by(1)
      cached_instance = Instance.find_by_name_and_owner_id(valid_input_attributes[:name], owner.id)
      cached_instance.host.should == valid_input_attributes[:host]
      cached_instance.port.should == valid_input_attributes[:port]
      cached_instance.maintenance_db.should == valid_input_attributes[:maintenance_db]
    end

    it "caches the db username and password" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      }.to change { InstanceAccount.count }.by(1)

      cached_instance = Instance.find_by_name_and_owner_id(valid_input_attributes[:name], owner.id)
      cached_instance_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_account.db_username.should == valid_input_attributes[:db_username]
      cached_instance_account.db_password.should == valid_input_attributes[:db_password]
    end

    it "shares the cached account" do
      Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)

      cached_instance = Instance.find_by_name(valid_input_attributes[:name])
      cached_instance_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_account.db_username.should == valid_input_attributes[:db_username]
      cached_instance_account.db_password.should == valid_input_attributes[:db_password]
    end

    it "can save a new instance that is shared" do
      instance = Gpdb::ConnectionBuilder.create!(valid_input_attributes.merge({:shared => true}), owner)
      instance.shared.should == true
    end

    it "saves the instance attributes" do
      instance = Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      valid_output_attributes.each { |key, value|
        instance[key].should == value unless (key == :username || key == :password)
      }
    end

    it "sets the instance_provider on the instance" do
      instance = Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      instance[:instance_provider].should == "Greenplum Database"
    end
  end

  describe ".update!" do
    let(:admin) { FactoryGirl.create(:user, :admin => true) }
    let(:cached_instance) { Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner) }
    let(:updated_attributes) { valid_input_attributes.merge(:name => "new name") }
    let(:updated_output_attributes) { valid_output_attributes.merge(:name => "new name") }

    it "allows admin to update" do
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, admin)
      updated_instance.name.should == "new name"
    end

    it "allows instance owners to update" do
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.name.should == "new name"
    end

    it "disallows anyone else" do
      other_user = FactoryGirl.create(:user)
      expect {
        Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, other_user)
      }.to raise_error(SecurityTransgression)
    end

    it "saves the changes to the instance" do
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.reload.name.should == "new name"
    end

    it "saves the change of description to the instance" do
      updated_attributes[:description] = "new description"
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.reload.description.should == "new description"
    end

    it "keeps the existing credentials" do
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      owners_account = updated_instance.owner_account
      owners_account.db_username.should == "bob"
      owners_account.db_password.should == "secret"
    end

    it "complains if it can't find an existing cached instance" do
      expect {
        Gpdb::ConnectionBuilder.update!('-1', updated_attributes, admin)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "requires that a real connection to GPDB can be established" do
      stub(ActiveRecord::Base).postgresql_connection { raise(PG::Error.new("connection error")) }
      lambda { Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner) }.should raise_error
      begin
        Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.get(:connection).should == [[:generic, {:message => "connection error"}]]
      end
    end

    describe "giving ownership to another user" do
      let(:new_owner) { FactoryGirl.create :user }

      context "when the new owner doesn't have account for the instance" do
        context "and the instance has shared accounts" do
          before do
            Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:shared => true), owner)
            @updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:shared => true, :owner => {:id => new_owner.to_param}), owner)
          end

          it "should succeed and give the account to the new owner" do
            @updated_instance.should be_present
            @updated_instance.owner.should == new_owner
            @updated_instance.accounts.count.should == 1
            @updated_instance.owner_account.owner.should == new_owner
            @updated_instance.owner_account.db_username.should == valid_input_attributes[:db_username]
            @updated_instance.owner_account.db_password.should == valid_input_attributes[:db_password]
          end
        end

        context "and the instance has individual accounts" do
          it "should raise ActiveRecord::RecordInvalid" do
            lambda {
              Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:owner => {:id => new_owner.to_param}), owner)
            }.should raise_error(ActiveRecord::RecordInvalid)
          end

          it "does not update the instance" do
            lambda {
              Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:owner => {:id => new_owner.to_param}, :name => "foobar"), owner)
            }.should raise_error

            cached_instance.reload.name.should_not == "foobar"
          end
        end
      end

      context "when the new owner has account for the instance" do
        let!(:new_owner_account) { FactoryGirl.create :instance_account, :owner => new_owner, :instance => cached_instance }

        context "and the instance has individual accounts" do
          before do
            @old_account_count = cached_instance.accounts.count
            @updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:owner => {:id => new_owner.to_param}, :name => "foobar"), owner)
          end
          it "succeeds" do
            @updated_instance.should be_present
            @updated_instance.owner.should == new_owner
            @updated_instance.accounts.count.should == @old_account_count
          end
        end
      end
    end
  end

  describe "#with_connection" do
    let(:instance) { FactoryGirl::create :instance, :host => "hello" }
    let(:instance_account) { FactoryGirl::create :instance_account, :db_username => "user1", :db_password => "pw1" }
    let(:fake_connection_adapter) do
      a = Object.new
      stub(a).disconnect!
      a
    end

    let(:expected_connection_params) do
      {
        host: instance.host,
        port: instance.port,
        database: expected_database,
        user: instance_account.db_username,
        password: instance_account.db_password
      }
    end

    let(:expected_database) { instance.maintenance_db }

    before do
      RR.reset
      mock(ActiveRecord::Base).postgresql_connection(expected_connection_params) { fake_connection_adapter }
    end

    context "when a database name is passed" do
      let(:expected_database) { "john_the_database" }

      it "connections to the given database and instance, with the given account" do
        Gpdb::ConnectionBuilder.with_connection(instance, instance_account, "john_the_database") {}
      end
    end

    context "when no database name is passed" do
      it "connects to the given instance's 'maintenance db''" do
        Gpdb::ConnectionBuilder.with_connection(instance, instance_account) {}
      end
    end

    context "when connection is successful" do
      it "calls the given block with the postgres connection" do
        mock(fake_connection_adapter).query("foo")
        Gpdb::ConnectionBuilder.with_connection(instance, instance_account) do |conn|
          conn.query("foo")
        end
      end

      it "returns the result of the block" do
        result = Gpdb::ConnectionBuilder.with_connection(instance, instance_account) do |conn|
          "value returned by block"
        end
        result.should == "value returned by block"
      end

      it "disconnects afterward" do
        mock(fake_connection_adapter).disconnect!
        Gpdb::ConnectionBuilder.with_connection(instance, instance_account) {}
      end
    end

    context "when the connection fails" do
      let(:fake_connection_adapter) { raise PG::Error }

      it "returns nil, and does not execute the given block" do
        result = Gpdb::ConnectionBuilder.with_connection(instance, instance_account) do |conn|
          @block_was_called = true
        end
        result.should be_nil
        @block_was_called.should be_false
      end
    end
  end
end
