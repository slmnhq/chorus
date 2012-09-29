require 'spec_helper'

describe WorkspaceDatasetsController do
  ignore_authorization!

  let(:user) { users(:the_collaborator) }
  let(:workspace) { workspaces(:public) }
  let(:gpdb_view) { datasets(:view) }
  let(:gpdb_table) { datasets(:table) }
  let(:other_table) { datasets(:other_table) }
  let(:source_table) { datasets(:source_table) }
  let(:source_view) { datasets(:source_view) }
  let(:the_datasets) { fake_relation [gpdb_table, gpdb_view] }

  before do
    log_in user

    mock(Workspace).
      workspaces_for(user).mock!.
      find(workspace.to_param) { workspace }

    stub(workspace).datasets { the_datasets }
    any_instance_of(GpdbTable) do |table|
      stub(table).accessible_to(user) { true }
    end
    any_instance_of(GpdbView) do |view|
      stub(view).accessible_to(user) { true }
    end
  end

  describe "#index" do
    it "presents the workspace's datasets, ordered by name and paginated" do
      mock_present { |collection| collection.should =~ the_datasets }
      get :index, :workspace_id => workspace.to_param
      response.should be_success
    end

    it "orders and paginates the datasets" do
      mock(the_datasets).order("lower(name)") { the_datasets }
      mock(the_datasets).paginate("page" => "2", "per_page" => "25") { the_datasets }
      get :index, :workspace_id => workspace.to_param, :page => "2", :per_page => "25"
    end

    it "passes the workspace to the presenter" do
      mock_present { |collection, _, options| options[:workspace].should be_true }
      get :index, :workspace_id => workspace.to_param
      end

    it "filter the list by the name_pattern value" do
      get :index, :workspace_id => workspace.to_param, :name_pattern => "view"
      decoded_response.each do |response|
        response.object_name.should =~ /view/
      end
    end

    it "should filter db objects by type" do
      mock(workspace).datasets(user, "SANDBOX_TABLE") { the_datasets }
      get :index, :workspace_id => workspace.to_param, :type => 'SANDBOX_TABLE'
    end
  end

  describe "#create" do
    let(:other_view) { datasets(:other_view) }

    it "should associate one table to the workspace" do
      post :create, :workspace_id => workspace.to_param, :dataset_ids => other_table.to_param
      response.code.should == "201"
      response.decoded_body.should_not be_nil
      workspace.bound_datasets.should include(other_table)
    end

    it "should associate multiple tables/views to the workspace for one table" do
      table_ids = other_table.to_param + "," + other_view.to_param

      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids
      response.code.should == "201"

      workspace.bound_datasets.should include(other_table)
      workspace.bound_datasets.should include(other_view)
    end

    it "should create event and activity" do
      table_ids = [other_table.to_param, other_view.to_param]
      post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids

      events = Events::SourceTableCreated.by(user)
      events.count.should == 2
    end

    context "when associating multiple datasets with a workspace" do
      it "shows an error if some datasets are already associated" do
        table_ids = [gpdb_table.to_param, other_table.to_param]
        post :create, :workspace_id => workspace.to_param, :dataset_ids => table_ids
        response.code.should == "422"
      end
    end
  end

  describe "#show" do
    it "does not present datasets not associated with the workspace" do
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

      context "when the dataset is a source table" do
        let(:the_datasets) { fake_relation [source_table] }

        generate_fixture "workspaceDataset/sourceTable.json" do
          get :show, :id => source_table.to_param, :workspace_id => workspace.to_param
        end
      end

      context "when the dataset is a source view" do
        let(:the_datasets) { fake_relation [source_view] }

        generate_fixture "workspaceDataset/sourceView.json" do
          get :show, :id => source_view.to_param, :workspace_id => workspace.to_param
        end
      end
    end
  end

  describe "#destroy" do
    it "deletes the association" do
      delete :destroy, :id => source_table.to_param, :workspace_id => workspace.to_param

      response.should be_success
      AssociatedDataset.find_by_dataset_id_and_workspace_id(gpdb_table.to_param, workspace.to_param).should be_nil
    end

    it "uses authorization" do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      delete :destroy, :id => source_table.to_param, :workspace_id => workspace.to_param
    end
  end
end
