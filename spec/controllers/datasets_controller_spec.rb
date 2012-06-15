require 'spec_helper'

describe DatasetsController do
  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace) }
  let!(:gpdb_view) { FactoryGirl.create(:gpdb_view) }
  let!(:gpdb_table) { FactoryGirl.create(:gpdb_table) }

  before do
    log_in user
  end

  describe "#index" do
    before do
      workspace.gpdb_database_objects << gpdb_table
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
      workspace.gpdb_database_objects.should include(gpdb_table)
    end

    it "should associate multiple tables/views to the workspace for one table" do
      table_ids = []
      table_ids << gpdb_table.to_param
      table_ids << gpdb_view.to_param

      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids
      response.code.should == "200"

      workspace.gpdb_database_objects.should include(gpdb_table)
      workspace.gpdb_database_objects.should include(gpdb_view)
    end
  end

  describe "#show" do
    let(:association) { FactoryGirl.create(:associated_dataset, :gpdb_database_object => gpdb_database_object) }

    context "the associated database object is a table" do
      let(:gpdb_database_object) { FactoryGirl.create(:gpdb_table) }

      generate_fixture "dataset/datasetTable.json" do
        get :show, :id => association.to_param
      end
    end

    context "the associated database object is a view" do
      let(:gpdb_database_object) { FactoryGirl.create(:gpdb_view) }

      generate_fixture "dataset/datasetView.json" do
        get :show, :id => association.to_param
      end
    end
  end
end