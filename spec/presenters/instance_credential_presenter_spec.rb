require 'spec_helper'

describe InstanceCredentialPresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user

    @instance = FactoryGirl.create :instance
    @instance.owner = @user

    @credential = FactoryGirl.create :instance_credential
    @credential.owner = @user
    @credential.instance = @instance

    @presenter = InstanceCredentialPresenter.new(@credential, view)
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

    it "sanitizes values" do
      bad_value = "<script>alert('got your cookie')</script>"

      credential = FactoryGirl.build :instance_credential, :username => bad_value
      json = InstanceCredentialPresenter.new(credential, view).to_hash

      json[:username].should_not match "<"
    end
  end
end