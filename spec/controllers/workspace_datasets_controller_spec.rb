require 'spec_helper'

describe WorkspaceDatasetsController do
  ignore_authorization!

  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace) }
  let(:gpdb_view) { FactoryGirl.create(:gpdb_view) }
  let(:gpdb_table) { FactoryGirl.create(:gpdb_table) }
  let(:datasets) { fake_relation [gpdb_table, gpdb_view] }

  before do
    log_in user

    mock(WorkspaceAccess).
      workspaces_for(user).mock!.
      find(workspace.to_param) { workspace }

    stub(workspace).datasets { datasets }
  end

  describe "#index" do
    it "presents the workspace's datasets, ordered by name and paginated" do
      mock_present { |collection| collection.should =~ datasets.to_a }
      get :index, :workspace_id => workspace.to_param
      response.should be_success
    end

    it "orders and paginates the datasets" do
      mock(datasets).order("lower(name)") { datasets }
      mock(datasets).paginate("page" => "2", "per_page" => "25") { datasets }
      get :index, :workspace_id => workspace.to_param, :page => "2", :per_page => "25"
    end

    it "passes the workspace to the presenter" do
      mock_present { |collection, _, options| options[:workspace].should be_true }
      get :index, :workspace_id => workspace.to_param
    end
  end

  describe "#create" do
    it "should associate one table to the workspace" do
      post :create, :workspace_id => workspace.to_param, :dataset_ids => gpdb_table.to_param
      response.code.should == "201"
      response.decoded_body.should_not be_nil
      workspace.bound_datasets.should include(gpdb_table)
    end

    it "should associate multiple tables/views to the workspace for one table" do
      table_ids = [gpdb_table.to_param, gpdb_view.to_param]

      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids
      response.code.should == "201"

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
    it "does not present datasets not associated with the workspace" do
      other_table = FactoryGirl.create(:gpdb_table)
      get :show, :id => other_table.to_param, :workspace_id => workspace.to_param
      response.should be_not_found
    end

    context "when the specified dataset is associated with the workspace" do
      context "when the dataset is a table" do
        let(:dataset) { gpdb_table }

        it "presents the specified dataset, including the workspace" do
          mock_present do |model, _, options|
            model.should == gpdb_table
            options[:workspace].should == workspace
          end

          get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
        end

        generate_fixture "workspaceDataset/datasetTable.json" do
          get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
        end
      end

      context "when the dataset is a view" do
        let(:dataset) { gpdb_view }

        generate_fixture "workspaceDataset/datasetView.json" do
          get :show, :id => dataset.to_param, :workspace_id => workspace.to_param
        end
      end
    end
  end

  describe "#destroy" do
    let!(:association) { FactoryGirl.create(:associated_dataset, :dataset=> gpdb_table, :workspace => workspace)}

    it "deletes the association" do
      delete :destroy, :id => gpdb_table.to_param, :workspace_id => workspace.to_param

      response.should be_success
      AssociatedDataset.find_by_dataset_id_and_workspace_id(gpdb_table.to_param, workspace.to_param).should be_nil
    end

    it "uses authorization" do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      delete :destroy, :id => gpdb_table.to_param, :workspace_id => workspace.to_param
    end
  end
end
