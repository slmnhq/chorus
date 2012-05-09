require 'spec_helper'

describe Gpdb::ConnectionChecker do
  let(:instance) { FactoryGirl.build(:instance) }
  let(:account) { FactoryGirl.build(:instance_account) }

  it "requires that a real connection to GPDB can be established" do
    stub(Gpdb::ConnectionBuilder).connect! { raise(PG::Error.new("connection error")) }

    begin
      Gpdb::ConnectionChecker.check!(instance, account)
      fail
    rescue ApiValidationError => e
      e.record.errors.get(:connection).should == [[:generic, {:message => "connection error"}]]
    end
  end

  it "sets the instance's status to be 'online''" do
    stub(Gpdb::ConnectionBuilder).connect!

    Gpdb::ConnectionChecker.check!(instance, account)

    instance.should be_online
  end

  it "check the validation of account attributes, before checking connection" do
    account.db_username = nil
    expect { Gpdb::ConnectionChecker.check!(instance, account) }.to raise_error ActiveRecord::RecordInvalid
  end

  it "check the validation of instance attributes, before checking connection" do
    instance.host = nil
    expect { Gpdb::ConnectionChecker.check!(instance, account) }.to raise_error ActiveRecord::RecordInvalid
  end
end