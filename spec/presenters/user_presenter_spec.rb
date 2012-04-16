require 'spec_helper'

describe UserPresenter do
  before(:each) do
    @user = User.create :username => 'admin', :password => 'secret', :password_confirmation => 'secret'
    @presenter = UserPresenter.new(@user)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:username)
    end

    it "does not include unwanted keys" do
      @hash.should_not have_key(:password_digest)
    end
  end
end