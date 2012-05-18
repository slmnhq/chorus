require 'spec_helper'

describe GpdbSchemaPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    schema.dataset_count = 50
    @presenter = GpdbSchemaPresenter.new(schema, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:id].should == 456
      @hash[:name].should == "abc"
      @hash[:instance_id].should == 123
      @hash[:instance_name].should == "instance1"
      @hash[:database_id].should == 789
      @hash[:database_name].should == "db1"
      @hash[:dataset_count].should == 50
    end
  end
end
