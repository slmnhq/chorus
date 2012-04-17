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
      @user = User.create :bogus => 'field', :username => 'aDmin', :password => 'secret', :first_name => "Jeau", :last_name => "Bleau", :email => "jb@emc.com"
      @user.should be_valid
      lambda{@user.bogus}.should raise_error
    end
  end
end
