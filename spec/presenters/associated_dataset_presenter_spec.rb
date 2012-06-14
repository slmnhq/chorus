require 'spec_helper'

describe AssociatedDatasetPresenter, :type => :view do
  let(:user) { FactoryGirl.build :user }

  before do
    stub(view).current_user { user }
  end

  describe "#to_hash" do
    let(:workspace) { FactoryGirl.build(:workspace)}
    let(:gpdb_table) { FactoryGirl.build(:gpdb_table)}
    let(:association) { FactoryGirl.build(:associated_dataset, :workspace => workspace, :gpdb_database_object => gpdb_table) }

    subject { described_class.new(association, view) }

    it "should have both workspace and dataset" do
      hash = subject.to_hash

      hash[:workspace][:name].should_not be_nil
      hash[:object_type].should == 'TABLE'
    end
  end
end
