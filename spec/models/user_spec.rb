require 'spec_helper'

describe User do
  describe ".authenticate" do
    before() do
      @user = User.create :username => 'admin', :password => 'secret', :password_confirmation => 'secret'
    end

    it "returns true if the password is correct" do
      User.authenticate('admin', 'secret').should be_true
    end

    it "returns false if the password is incorrect" do
      User.authenticate('admin', 'bogus').should be_false
    end
  end
end
