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
    let(:instance) { gpdb_instances(:greenplum) }
    let(:passphrase) {"secret0123456789"}
    let(:password) {"apass"}
    let!(:instance_account) do
      instance.accounts.create!(
          {:db_password => password, :db_username => 'aname', :owner => owner},
          :without_protection => true)
    end

    it "encrypts the password with the phrasekey" do
      (password, salt) = get_password_from_database(instance_account.id).split
      password.should == Base64.strict_encode64(encrypt_cipher('apass', Base64.strict_decode64(salt)))
    end

    it "decrypts the password with the phrasekey" do
      InstanceAccount.find(instance_account.id).db_password.should == 'apass'
    end

    def get_password_from_database(account_id)
      ActiveRecord::Base.connection.select_values("select encrypted_db_password from instance_accounts where id = #{account_id}").first
    end

    def encrypt_cipher(password, salt)
      cipher = OpenSSL::Cipher::AES.new("128-CBC").encrypt
      cipher.pkcs5_keyivgen(passphrase, salt)
      cipher.update(password) + cipher.final
    end
  end
end
