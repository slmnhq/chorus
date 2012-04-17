require 'spec_helper'

describe User do
  describe ".authenticate" do
    before do
      @user = FactoryGirl.create :user, :username => 'aDmin'
    end

    it "returns true if the password is correct" do
      User.authenticate('aDmin', 'secret').should be_true
    end

    it "returns false if the password is incorrect" do
      User.authenticate('aDmin', 'bogus').should be_false
    end

    it "is case insensitive" do
      User.authenticate("ADmIN", 'secret').should be_true
    end

    it "should ignore fields that aren't in the model" do
      @user = User.create :bogus => 'field', :username => 'aDmin2', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
      @user.should be_valid
      lambda{@user.bogus}.should raise_error
    end
  end

  describe ".admin_count" do
    it "returns the number of admins that exist" do
      FactoryGirl.create :admin
      User.admin_count.should == 1

      FactoryGirl.create :user
      User.admin_count.should == 1

      FactoryGirl.create :admin
      User.admin_count.should == 2
    end
  end

  describe "#admin=" do
    let(:admin) { FactoryGirl.create :admin }

    it "allows an admin to remove their own privileges, if there are other admins" do
      other_admin = FactoryGirl.create(:admin)
      admin.admin = false
      admin.should_not be_admin
    end

    it "does not allow an admin to remove their own priveleges if there are no other admins" do
      admin.admin = false
      admin.should be_admin
    end
  end
end
