require 'spec_helper'

describe DatasetPresenter, :type => :view do
  before do
    @user = FactoryGirl.create :user
    stub(ActiveRecord::Base).current_user { @user }
  end

  it_behaves_like "dataset presenter", :gpdb_table
  let(:workspace) { FactoryGirl.create :workspace }
  let(:presenter) { described_class.new(dataset, view, {:workspace => workspace, :activity_stream => activity_stream}) }
  let(:activity_stream) { nil }
  let(:hash) { presenter.to_hash }

  describe ".associated_workspaces_hash" do

    let(:dataset) { FactoryGirl.create :gpdb_table }
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

    it "includes associated workspaces" do
      hash[:associated_workspaces][0][:id].should == workspace.id
      hash[:associated_workspaces][0][:name].should == workspace.name
    end

    context "when rendering an activity stream" do
      let(:activity_stream) { true }

      it "does not render any associated workspaces" do
        hash[:associated_workspaces].should be_empty
      end
    end
  end

  describe "#to_hash" do
    context "when rendering an activity stream" do
      let(:workspace) { FactoryGirl.create :workspace }
      let(:dataset) { FactoryGirl.create :gpdb_table, :schema => schema }
      let(:schema) { FactoryGirl.create :gpdb_schema }
      let(:activity_stream) { true }

      it "renders only the schema id" do
        hash[:schema][:id].should == schema.id
        hash[:schema].keys.size.should == 1
      end
    end

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
      let!(:import_schedule) { FactoryGirl.create(:import_schedule, :source_dataset => dataset, :workspace => workspace, :start_datetime => Time.now(), :end_date => '2012-12-12', :frequency => "weekly" ) }

      it "has the correct type" do
        hash[:type].should == 'SOURCE_TABLE'
        hash[:frequency].should == import_schedule.frequency
      end
    end

  end
end