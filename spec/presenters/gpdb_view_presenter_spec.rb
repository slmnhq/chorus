require 'spec_helper'

describe GpdbViewPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    statistics = DatasetStatistics.new( :definition => "select * from everybody" )
    db_view = FactoryGirl.build(:gpdb_view, :id => 321, :name => "view1", :schema => schema, :statistics => statistics)

    @presenter = GpdbViewPresenter.new(db_view, view)
  end

  describe "#to_hash" do
    let(:hash) { @presenter.to_hash }
    subject { hash }

    its [:object_type] { should == "VIEW" }
  end

  it_behaves_like "dataset presenter", :gpdb_view
end
