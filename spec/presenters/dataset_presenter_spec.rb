require 'spec_helper'

describe DatasetPresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user
    stub(view).current_user { @user }
  end

  it_behaves_like "dataset presenter", :gpdb_table
  let(:workspace) { FactoryGirl.create :workspace }
  let(:presenter) { described_class.new(dataset, view, {:workspace => workspace}) }
  let(:hash) { presenter.to_hash }

  describe ".associated_workspaces_hash" do

    let(:dataset) { FactoryGirl.create :gpdb_table }
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

    it "includes associated workspaces" do
      hash[:associated_workspaces][0][:id].should == workspace.id
      hash[:associated_workspaces][0][:name].should == workspace.name
    end
  end

  describe "#to_hash" do
    context "for a sandbox table" do
      let(:workspace) { FactoryGirl.create :workspace }
      let(:dataset) { FactoryGirl.create :gpdb_table, :schema => schema }
      let(:schema) { FactoryGirl.create :gpdb_schema }

      it "has the correct type" do
        workspace.sandbox_id = schema.id
        hash[:type].should == 'SANDBOX_TABLE'
      end
    end

    context "for a source table" do
      let(:workspace) { FactoryGirl.create :workspace }
      let(:dataset) { FactoryGirl.create :gpdb_table, :schema => schema }
      let(:schema) { FactoryGirl.create :gpdb_schema }
      let(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

      it "has the correct type" do
        hash[:type].should == 'SOURCE_TABLE'
      end
    end

  end
end