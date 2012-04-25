require 'spec_helper'

describe Gpdb::ConnectionBuilder do
  let(:owner) { FactoryGirl.create(:user) }
  let(:valid_attributes) do
    {
        :name => "new",
        :port => 12345,
        :host => "server.emc.com",
        :database => "postgres",
        :username => "bob",
        :password => "secret"
    }
  end

  before do
    connection = stub(:verify_connection! => true)
    Gpdb::Connection.stub(:new) { connection }
  end

  describe ".create!" do
    it "requires name" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_attributes.merge(:name => nil), owner)
      }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it "requires db connection params" do
      [:host, :port, :database].each do |attribute|
        expect {
          Gpdb::ConnectionBuilder.create!(valid_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires db username and password" do
      [:username, :password].each do |attribute|
        expect {
          Gpdb::ConnectionBuilder.create!(valid_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires that a real connection to GPDB can be established" do
      connection = double
      connection.stub(:verify_connection!).and_raise(Gpdb::ConnectionError.new("connection error"))
      Gpdb::Connection.should_receive(:new).with(valid_attributes) { connection }

      begin
        Gpdb::ConnectionBuilder.create!(valid_attributes, owner)
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.get(:connection).should == ["connection error"]
      end
    end

    it "caches the db name, owner and connection params" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_attributes, owner)
      }.to change { Instance.count }.by(1)
      cached_instance = Instance.find_by_name_and_owner_id(valid_attributes[:name], owner.id)
      cached_instance.host.should == valid_attributes[:host]
      cached_instance.port.should == valid_attributes[:port]
      cached_instance.maintenance_db.should == valid_attributes[:database]
    end

    it "caches the db username and password" do
      expect {
        Gpdb::ConnectionBuilder.create!(valid_attributes, owner)
      }.to change { InstanceCredential.count }.by(1)

      cached_instance = Instance.find_by_name_and_owner_id(valid_attributes[:name], owner.id)
      cached_instance_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_credentials.username.should == valid_attributes[:username]
      cached_instance_credentials.password.should == valid_attributes[:password]
    end

    it "shares the cached credentials" do
      Gpdb::ConnectionBuilder.create!(valid_attributes, owner)

      cached_instance = Instance.find_by_name(valid_attributes[:name])
      cached_instance_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_credentials.username.should == valid_attributes[:username]
      cached_instance_credentials.password.should == valid_attributes[:password]
    end
  end

  describe ".update!" do
    let(:admin) { FactoryGirl.create(:user, :admin => true) }
    let(:cached_instance) { Gpdb::ConnectionBuilder.create!(valid_attributes, owner) }
    let(:updated_attributes) { valid_attributes.merge(:name => "new name") }

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

    it "saves the owner's changes to their credentials" do
      updated_attributes[:password] = "newpass"
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      owners_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_credentials.password.should == "newpass"
    end

    it "ignores the admin's changes to the credentials" do
      updated_attributes[:password] = "newpass"
      updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, admin)
      owners_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, updated_instance.id)
      owners_credentials.password.should == "secret"
    end

    it "complains if it can't find an existing cached instance" do
      expect {
        Gpdb::ConnectionBuilder.update!('-1', updated_attributes, admin)
      }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it "requires that a real connection to GPDB can be established" do
      connection = double
      connection.stub(:verify_connection!).and_raise(Gpdb::ConnectionError.new("connection error"))
      Gpdb::Connection.should_receive(:new).with(updated_attributes) { connection }

      begin
        Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes, owner)
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.get(:connection).should == ["connection error"]
      end
    end

    describe("switching from individual to shared") do
      let!(:other_credentials) { FactoryGirl.create(:instance_credential, :instance => cached_instance) }
      let!(:instance_owner_credentials) { cached_instance.owner_credentials }

      before do
        @updated_instance = Gpdb::ConnectionBuilder.update!(cached_instance.to_param, updated_attributes.merge(:shared => true), owner)
      end

      it "sets the shared attribute" do
        @updated_instance.should be_shared
      end

      it "deletes credentials other than those belonging to the instance owner" do
        InstanceCredential.where(:id => instance_owner_credentials.id).should be_present
        InstanceCredential.where(:id => other_credentials.id).should_not be_present
      end
    end
  end
end
