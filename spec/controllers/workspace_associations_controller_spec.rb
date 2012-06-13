require 'spec_helper'

describe WorkspaceAssociationsController do
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
    it "should associate the table to the workspace" do
      post :create, :workspace_id => workspace.to_param, :gpdb_database_object_id => gpdb_table.to_param
      response.code.should == "200"
      workspace.gpdb_database_objects.should include(gpdb_table)
    end
  end
end