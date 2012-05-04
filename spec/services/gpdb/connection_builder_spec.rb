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

      cached_instance_account.username.should == valid_input_attributes[:db_username]
      cached_instance_account.password.should == valid_input_attributes[:db_password]
    end

    it "shares the cached account" do
      Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)

      cached_instance = Instance.find_by_name(valid_input_attributes[:name])
      cached_instance_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_account.username.should == valid_input_attributes[:db_username]
      cached_instance_account.password.should == valid_input_attributes[:db_password]
    end

    it "can save a new instance that is shared" do
      instance = Gpdb::ConnectionBuilder.create!(valid_input_attributes.merge({:shared => true}), owner)
      instance.shared.should == true
    end

    it "saves the instance attributes" do
      instance = Gpdb::ConnectionBuilder.create!(valid_input_attributes, owner)
      valid_output_attributes.each {| key, value |
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

    it "uses the existing credentials if none are provided" do
      updated_attributes[:db_password] = nil
      updated_attributes[:db_username] = nil

      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      owners_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_account.username.should == "bob"
      owners_account.password.should == "secret"
    end

    it "saves the owner's changes to their account" do
      updated_attributes[:db_password] = "newpass"
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      owners_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_account.password.should == "newpass"
    end

    it "ignores the admin's changes to the account" do
      updated_attributes[:db_password] = "newpass"
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, admin)
      owners_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_account.password.should == "secret"
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

    describe("switching from individual to shared") do
      let!(:other_account) { FactoryGirl.create(:instance_account, :instance => cached_instance) }
      let!(:instance_owner_account) { cached_instance.owner_account }

      before do
        @updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes.merge(:shared => "true"), owner)
      end

      it "sets the shared attribute" do
        @updated_instance.should be_shared
      end

      it "deletes accounts other than those belonging to the instance owner" do
        InstanceAccount.where(:id => instance_owner_account.id).should be_present
        InstanceAccount.where(:id => other_account.id).should_not be_present
      end
    end

    describe("switching from shared to individual") do
      before do
        Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:shared => "true"), owner)
        @updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, valid_input_attributes.merge(:shared => "false"), owner)
      end

      it "clears the shared attribute" do
        @updated_instance.should be_present
        @updated_instance.should_not be_shared
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
            @updated_instance.owner_account.username.should == valid_input_attributes[:db_username]
            @updated_instance.owner_account.password.should == valid_input_attributes[:db_password]
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

  describe "#test_connection" do
    let(:instance1) { FactoryGirl::create :instance, :host => "hello" }
    let(:instance2) { FactoryGirl::create :instance, :host => "local" }

    before(:each) do
      stub(ActiveRecord::Base).postgresql_connection(host: "hello", port: instance1.port, database: instance1.maintenance_db) { true }
      stub(ActiveRecord::Base).postgresql_connection(host: "local", port: instance2.port, database: instance2.maintenance_db) { raise PG::Error }
    end

    it "returns the correct connection status" do
      Gpdb::ConnectionBuilder.test_connection(instance1).should == true
      Gpdb::ConnectionBuilder.test_connection(instance2).should == false
    end
  end
end
