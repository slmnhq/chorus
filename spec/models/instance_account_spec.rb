require 'spec_helper'

describe InstanceAccount do
  it "should allow mass-assignment of username and password" do
    InstanceAccount.new(:db_username => 'aname').db_username.should == 'aname'
    InstanceAccount.new(:db_password => 'apass').db_password.should == 'apass'
  end

  describe "validations" do
    it { should validate_presence_of :db_username }
    it { should validate_presence_of :db_password }
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should validate_presence_of :owner_id }

    it { should belong_to :gpdb_instance }
    it { should validate_presence_of :gpdb_instance_id }
  end

  describe "password encryption in the rails database" do
    let(:owner) { users(:admin) }
    let(:instance) { gpdb_instances(:default) }
    let(:secret_key) { '\0' * 32 }
    let(:password) { "apass" }
    let!(:instance_account) do
      instance.accounts.create!(
          {:db_password => password, :db_username => 'aname', :owner => owner},
          :without_protection => true)
    end

    it "stores db_password as encrypted_db_password using the attr_encrypted gem" do
      ActiveRecord::Base.connection.select_values("select encrypted_db_password
                                                  from instance_accounts where id = #{instance_account.id}") do |db_password|
        db_password.should_not be_nil
        db_password.should_not == password
      end
    end
  end
end
