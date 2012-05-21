require 'spec_helper'

describe GpdbTablePresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    table = FactoryGirl.build(:gpdb_table, :id => 321, :name => "table1", :schema => schema)

    @presenter = GpdbTablePresenter.new(table, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:id].should == 321
      @hash[:name].should == "table1"
      @hash[:schema_id].should == 456
      @hash[:schema_name].should == "abc"
      @hash[:instance][:id].should == 123
      @hash[:instance][:name].should == "instance1"
      @hash[:database_id].should == 789
      @hash[:database_name].should == "db1"
    end
  end
end
