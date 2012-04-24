require 'spec_helper'

describe Gpdb::Instance do
  describe ".create" do
    before do
      connection = stub(:connected? => true)
      Gpdb::Connection.stub(:new) { connection }
    end

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

    it "requires name" do
      expect {
        Gpdb::Instance.create!(valid_attributes.merge(:name => nil), owner)
      }.to raise_error(ActiveRecord::RecordInvalid)
    end

    it "requires db connection params" do
      [:host, :port, :database].each do |attribute|
        expect {
          Gpdb::Instance.create!(valid_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires db username and password" do
      [:username, :password].each do |attribute|
        expect {
          Gpdb::Instance.create!(valid_attributes.merge(attribute => nil), owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    it "requires that a real connection to GPDB can be established" do
      connection = stub(:connected? => false)
      Gpdb::Connection.should_receive(:new).with(valid_attributes) { connection }

      begin
        Gpdb::Instance.create!(valid_attributes, owner)
      rescue ActiveRecord::RecordInvalid => e
        e.record.errors.get(:connection).should == ["INVALID"]
      end
    end

    it "caches the db name, owner and connection params" do
      expect {
        Gpdb::Instance.create!(valid_attributes, owner)
      }.to change { Instance.count }.by(1)
      cached_instance = Instance.find_by_name_and_owner_id(valid_attributes[:name], owner.id)
      cached_instance.host.should == valid_attributes[:host]
      cached_instance.port.should == valid_attributes[:port]
      cached_instance.maintenance_db.should == valid_attributes[:database]
    end

    it "caches the db username and password" do
      expect {
        Gpdb::Instance.create!(valid_attributes, owner)
      }.to change { InstanceCredential.count }.by(1)

      cached_instance = Instance.find_by_name_and_owner_id(valid_attributes[:name], owner.id)
      cached_instance_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_credentials.username.should == valid_attributes[:username]
      cached_instance_credentials.password.should == valid_attributes[:password]
    end

    it "shares the cached credentials" do
      Gpdb::Instance.create!(valid_attributes, owner)

      cached_instance = Instance.find_by_name(valid_attributes[:name])
      cached_instance_credentials = InstanceCredential.find_by_owner_id_and_instance_id(owner.id, cached_instance.id)

      cached_instance_credentials.should be_shared
    end
  end
end
