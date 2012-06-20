require 'spec_helper'

describe WorkspaceDatasetsController do
  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace) }
  let!(:gpdb_view) { FactoryGirl.create(:gpdb_view) }
  let!(:gpdb_table) { FactoryGirl.create(:gpdb_table) }

  before do
    log_in user
  end

  describe "#index" do
    before do
      workspace.bound_datasets << gpdb_table
    end

    it "retrieves all gpdb objects associated with the workspace" do
      get :index, :workspace_id => workspace.to_param

      decoded_response.map(&:id).should include(gpdb_table.id)
      decoded_response.map(&:id).should_not include(gpdb_view.id)
    end
  end

  describe "#create" do
    it "should associate one table to the workspace" do
      post :create, :workspace_id => workspace.to_param, :dataset_ids => gpdb_table.to_param
      response.code.should == "200"
      workspace.bound_datasets.should include(gpdb_table)
    end

    it "should associate multiple tables/views to the workspace for one table" do
      table_ids = [gpdb_table.to_param, gpdb_view.to_param]

      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids
      response.code.should == "200"

      workspace.bound_datasets.should include(gpdb_table)
      workspace.bound_datasets.should include(gpdb_view)
    end

    it "should create event and activity" do
      table_ids = [gpdb_table.to_param, gpdb_view.to_param]
      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids

      events = Events::SOURCE_TABLE_CREATED.by(user)
      events.count.should == 2
    end
  end

  describe "#show" do
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

    context "the associated database object is a table" do
      let!(:dataset) { FactoryGirl.create(:gpdb_table) }

      generate_fixture "dataset/datasetTable.json" do
        get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
      end

      it "returns the associated dataset" do
        get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
        response.code.should == "200"

        decoded_response.object_name.should == dataset.name
        decoded_response.type.should == "SOURCE_TABLE"
      end
    end

    context "the associated database object is a view" do
      let!(:dataset) { FactoryGirl.create(:gpdb_view) }

      generate_fixture "dataset/datasetView.json" do
        get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
      end

      it "returns the associated dataset" do
        get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
        response.code.should == "200"

        decoded_response.object_name.should == dataset.name
        decoded_response.type.should == "SOURCE_TABLE"
      end
    end
  end
end