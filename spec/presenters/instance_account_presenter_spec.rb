require 'spec_helper'

describe InstanceAccountPresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user

    @instance = FactoryGirl.create :instance
    @instance.owner = @user

    @account = FactoryGirl.create :instance_account
    @account.owner = @user
    @account.instance = @instance

    @presenter = InstanceAccountPresenter.new(@account, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys and values" do
      @hash[:id].should == @account.id
      @hash[:owner_id].should == @user.id
      @hash[:instance_id].should == @instance.id
      @hash[:username].should == @account[:username]
    end

    it "should use ownerPresenter Hash method for owner" do
      @owner = @hash[:owner]
      @owner.to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"

      account = FactoryGirl.build :instance_account, :username => bad_value
      json = InstanceAccountPresenter.new(account, view).to_hash

      json[:username].should_not match "<"
    end
  end
end