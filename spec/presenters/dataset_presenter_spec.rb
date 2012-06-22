require 'spec_helper'

describe DatasetPresenter, :type => :view do
  it_behaves_like "dataset presenter", :gpdb_table

  describe ".associated_workspaces_hash" do
    let(:workspace) { FactoryGirl.create :workspace }
    let!(:dataset) { FactoryGirl.create :gpdb_table }
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace)}
    let(:presenter) { described_class.new(dataset, view) }
    let(:hash) { presenter.to_hash }

    it "includes associated workspaces" do
        hash[:associated_workspaces][0][:id].should == workspace.id
        hash[:associated_workspaces][0][:name].should == workspace.name
    end
  end
end