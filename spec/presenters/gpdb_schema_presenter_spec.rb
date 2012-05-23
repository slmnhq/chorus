require 'spec_helper'

describe GpdbSchemaPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.create(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.create(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.create(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    FactoryGirl.create(:gpdb_table, :id => 1, :name => "table1", :schema => schema)
    FactoryGirl.create(:gpdb_view, :id => 2, :name => "view1", :schema => schema)
    schema.reload

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
      @hash[:dataset_count].should == 2
    end
  end
end
