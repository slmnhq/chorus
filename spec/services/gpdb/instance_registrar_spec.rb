require 'spec_helper'

describe Gpdb::InstanceRegistrar do
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

  before do
    stub(Gpdb::ConnectionBuilder).connect!
  end

  describe ".create!" do
    it "requires name" do
      expect {
        Gpdb::InstanceRegistrar.create!(valid_input_attributes.merge(:name => nil), owner)
      }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it "requires db connection params" do
      [:host, :port, :maintenance_db].each do |attribute|
        expect {
          Gpdb::InstanceRegistrar.create!(valid_input_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires db username and password" do
      [:db_username, :db_password].each do |attribute|
        expect {
          Gpdb::InstanceRegistrar.create!(valid_input_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires that a real connection to GPDB can be established" do
      stub(Gpdb::ConnectionBuilder).connect! { raise(PG::Error.new("connection error")) }

      begin
        Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner)
        fail
      rescue ApiValidationError => e
        e.record.errors.get(:connection).should == [[:generic, {:message => "connection error"}]]
      end
    end

    it "caches the db name, owner and connection params" do
      expect {
        Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner)
      }.to change { Instance.count }.by(1)
      cached_instance = Instance.find_by_name_and_owner_id(valid_input_attributes[:name], owner.id)
      cached_instance.host.should == valid_input_attributes[:host]
      cached_instance.port.should == valid_input_attributes[:port]
      cached_instance.maintenance_db.should == valid_input_attributes[:maintenance_db]
      cached_instance.provision_type.should == valid_input_attributes[:provision_type]
      cached_instance.description.should == valid_input_attributes[:description]
    end

    it "sets the instance's status to be 'online''" do
      instance = Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner)
      instance.should be_online
    end

    it "caches the db username and password" do
      expect {
        Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner)
      }.to change { InstanceAccount.count }.by(1)

      cached_instance = Instance.find_by_name_and_owner_id(valid_input_attributes[:name], owner.id)
      cached_instance_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_account.db_username.should == valid_input_attributes[:db_username]
      cached_instance_account.db_password.should == valid_input_attributes[:db_password]
    end

    it "can save a new instance that is shared" do
      instance = Gpdb::InstanceRegistrar.create!(valid_input_attributes.merge({:shared => true}), owner)
      instance.shared.should == true
    end

    it "sets the instance_provider on the instance" do
      instance = Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner)
      instance[:instance_provider].should == "Greenplum Database"
    end
  end

  describe ".update!" do
    let(:admin) { FactoryGirl.create(:user, :admin => true) }
    let(:cached_instance) { Gpdb::InstanceRegistrar.create!(valid_input_attributes, owner) }
    let(:updated_attributes) { valid_input_attributes.merge(:name => "new name") }
    let(:updated_output_attributes) { valid_input_attributes.merge(:name => "new name") }

    it "allows admin to update" do
      updated_instance = Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, admin)
      updated_instance.name.should == "new name"
    end

    it "allows instance owners to update" do
      updated_instance = Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.name.should == "new name"
    end

    it "disallows anyone else" do
      other_user = FactoryGirl.create(:user)
      expect {
        Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, other_user)
      }.to raise_error(SecurityTransgression)
    end

    it "saves the changes to the instance" do
      updated_instance = Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.reload.name.should == "new name"
    end

    it "saves the change of description to the instance" do
      updated_attributes[:description] = "new description"
      updated_instance = Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, owner)
      updated_instance.reload.description.should == "new description"
    end

    it "keeps the existing credentials" do
      updated_instance = Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, owner)
      owners_account = InstanceAccount.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_account.db_username.should == "bob"
      owners_account.db_password.should == "secret"
    end

    it "complains if it can't find an existing cached instance" do
      expect {
        Gpdb::InstanceRegistrar.update!('-1', updated_attributes, admin)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "requires that a real connection to GPDB can be established" do
      stub(Gpdb::ConnectionBuilder).connect! { raise(PG::Error.new("connection error")) }

      begin
        Gpdb::InstanceRegistrar.update!(cached_instance.to_param, updated_attributes, owner)
        fail
      rescue ApiValidationError => e
        e.record.errors.get(:connection).should == [[:generic, {:message => "connection error"}]]
      end
    end
  end
end
