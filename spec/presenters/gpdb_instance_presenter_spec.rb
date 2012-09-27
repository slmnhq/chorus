require 'spec_helper'

describe GpdbInstancePresenter, :type => :view do
  before(:each) do
    @user = FactoryGirl.create :user

    @gpdb_instance = FactoryGirl.build :gpdb_instance
    @gpdb_instance.owner = @user
    @presenter = GpdbInstancePresenter.new(@gpdb_instance, view)
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
      @hash.should have_key(:used_by_workspaces)
    end

    it "should use ownerPresenter Hash method for owner" do
      @owner = @hash[:owner]
      @owner.to_hash.should == (UserPresenter.new(@user, view).to_hash)
    end

    it_behaves_like "sanitized presenter", :gpdb_instance, :name
    it_behaves_like "sanitized presenter", :gpdb_instance, :host
  end
end