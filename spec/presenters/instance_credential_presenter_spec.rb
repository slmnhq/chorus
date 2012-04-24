require 'spec_helper'

describe InstanceCredentialPresenter do
  before do
    @user = FactoryGirl.create :user

    @instance = FactoryGirl.create :instance
    @instance.owner = @user

    @credential = FactoryGirl.create :instance_credential
    @credential.owner = @user
    @credential.instance = @instance

    @presenter = InstanceCredentialPresenter.new(@credential)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys and values" do
      @hash[:id].should == @credential.id
      @hash[:owner_id].should == @user.id
      @hash[:instance_id].should == @instance.id
      @hash[:username].should == @credential[:username]
    end
  end
end