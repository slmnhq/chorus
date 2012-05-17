require 'spec_helper'

describe GpdbSchemaPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123)
    database = FactoryGirl.build(:gpdb_database, :instance => instance, :name => "db1")
    schema = FactoryGirl.build(:gpdb_schema, :name => "abc", :database => database)
    schema.dataset_count = 50
    @presenter = GpdbSchemaPresenter.new(schema, view)
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
