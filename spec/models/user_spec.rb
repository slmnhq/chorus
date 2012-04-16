require 'spec_helper'

describe User do
  describe ".authenticate" do
    before do
      @user = User.create :username => 'aDmin', :password => 'secret', :password_confirmation => 'secret'
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
  end
end
