require 'spec_helper'

describe GpdbViewPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    db_view = FactoryGirl.build(:gpdb_view, :id => 321, :name => "view1", :schema => schema)

    @presenter = GpdbViewPresenter.new(db_view, view)
  end

  describe "#to_hash" do
    before do
      @hash = @presenter.to_hash
    end

    it "includes the fields" do
      @hash[:id].should == 321
      @hash[:object_name].should == "view1"
      @hash[:schema_id].should == 456
      @hash[:schema_name].should == "abc"
      @hash[:instance][:id].should == 123
      @hash[:instance][:name].should == "instance1"
      @hash[:database_id].should == 789
      @hash[:database_name].should == "db1"
      @hash[:type].should == "SOURCE_TABLE"
      @hash[:object_type].should == "VIEW"
    end
  end
end
