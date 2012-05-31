require 'spec_helper'

describe GpdbViewPresenter, :type => :view do
  before(:each) do
    instance = FactoryGirl.build(:instance, :id => 123, :name => "instance1")
    database = FactoryGirl.build(:gpdb_database, :id => 789, :name => "db1", :instance => instance)
    schema = FactoryGirl.build(:gpdb_schema, :id => 456, :name => "abc", :database => database)
    db_view = FactoryGirl.build(:gpdb_view, :id => 321, :name => "view1", :schema => schema, :definition => "select * from everybody")

    @presenter = GpdbViewPresenter.new(db_view, view)
  end

  describe "#to_hash" do
    let(:hash) { @presenter.to_hash }
    subject { hash }

    its [:object_type] { should == "VIEW" }
    its [:definition] { should == "select * from everybody" }
  end

  it_behaves_like "database object presenter", :gpdb_view
end
