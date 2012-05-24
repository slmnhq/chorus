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

    it "sets the object type to TABLE" do
      @hash[:object_type].should == "TABLE"
    end
  end

  it_behaves_like "database object presenter", :gpdb_table
end
