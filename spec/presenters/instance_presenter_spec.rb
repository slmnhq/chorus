require 'spec_helper'

describe InstancePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.create :user

    @instance = FactoryGirl.build :instance
    @instance.owner = @user
    @presenter = InstancePresenter.new(@instance, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the right keys" do
      @hash.should have_key(:name)
      @hash.should have_key(:port)
      @hash.should have_key(:host)
      @hash.should have_key(:id)
      @hash.should have_key(:owner)
      @hash.should have_key(:shared)
      @hash.should have_key(:state)
      @hash.should have_key(:provision_type)
      @hash.should have_key(:maintenance_db)
      @hash.should have_key(:description)
      @hash.should have_key(:instance_provider)
      @hash.should have_key(:version)
    end

    it "should use ownerPresenter Hash method for owner" do
      @owner = @hash[:owner]
      @owner.to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it_behaves_like "sanitized presenter", :instance, :name
    it_behaves_like "sanitized presenter", :instance, :host
  end
end