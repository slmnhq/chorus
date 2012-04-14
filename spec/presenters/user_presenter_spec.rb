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
  end
end