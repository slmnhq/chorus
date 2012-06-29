require 'spec_helper'

describe InstanceAccount do
  it "should allow mass-assignment of username and password" do
    InstanceAccount.new(:db_username => 'aname').db_username.should == 'aname'
    InstanceAccount.new(:db_password => 'apass').db_password.should == 'apass'
  end

  describe "validations" do
    it { should validate_presence_of :db_username }
    it { should validate_presence_of :db_password }

    describe "field length" do
      it { should ensure_length_of(:db_password).is_at_most(256)  }
      it { should ensure_length_of(:db_password).is_at_least(6) }
    end
  end

  describe "associations" do
    it { should belong_to :owner }
    it { should validate_presence_of :owner_id }

    it { should belong_to :instance }
    it { should validate_presence_of :instance_id }
  end
end
