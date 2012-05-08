require 'spec_helper'

describe SchemaPresenter, :type => :view do
  before(:each) do
    @presenter = SchemaPresenter.new(Schema.new("abc", 123, "db1", 50), view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:name].should == "abc"
      @hash[:instance_id].should == 123
      @hash[:database_name].should == "db1"
      @hash[:dataset_count].should == 50
    end
  end
end