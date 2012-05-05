require 'spec_helper'

describe InstanceAccount do
  it "should allow mass-assignment of username and password" do
    InstanceAccount.new(:db_username => 'aname').db_username.should == 'aname'
    InstanceAccount.new(:db_password => 'apass').db_password.should == 'apass'
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should validate_presence_of :owner}

    it { should belong_to :instance }
    it { should validate_presence_of :instance}
  end

  context "#make_connection" do
    let(:dbconfig) {HashWithIndifferentAccess.new_from_hash_copying_default(YAML.load_file("config/database.yml")[Rails.env])}
    let(:instance) {FactoryGirl.create :instance, :host => dbconfig[:host]||"localhost", :port => dbconfig[:port]}
    let(:account) {FactoryGirl.create :instance_account, :instance => instance, :db_username => dbconfig[:username], :db_password => dbconfig[:password]}
  
    it "yields a sql_connection" do
      account.make_connection.should be_instance_of ActiveRecord::ConnectionAdapters::PostgreSQLAdapter
    end
  end
end
