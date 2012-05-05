require 'spec_helper'

describe DatabasePresenter, :type => :view do
  before(:each) do
    @presenter = DatabasePresenter.new(Database.new("abc", 123), view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:name].should == "abc"
      @hash[:instance_id].should == 123
    end
  end
end