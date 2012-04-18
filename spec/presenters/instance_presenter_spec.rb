require 'spec_helper'

describe InstancePresenter do
  before(:each) do
    @instance = FactoryGirl.build :instance
    @presenter = InstancePresenter.new(@instance)
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
    end
  end

end