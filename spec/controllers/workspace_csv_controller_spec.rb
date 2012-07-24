require 'spec_helper'

describe WorkspaceCsvController do
  ignore_authorization!

  let(:user) { users(:bob) }
  let(:non_auth_user) { users(:alice)}
  let(:file) { test_file("test.csv", "text/csv") }
  let(:workspace) { workspaces(:bob_public) }
  let(:csv_file_params) do
    {
        :workspace_id => workspace.to_param,
        :csv=> {
            :contents => file
        }
    }
  end

  before do
    log_in user
  end

  describe "#create" do

    it "saves the user and workspace onto the csv file" do
      post :create, csv_file_params
      csv_file = CsvFile.last
      csv_file.user.should == user
      csv_file.workspace.should == workspace
    end

    it "returns 100 rows" do
      post :create, csv_file_params

      decoded_response['contents'].should have(100).lines
      decoded_response['contents'].should include('99,99,99')
      decoded_response['contents'].should_not include('100,100,100')

    end

    it "uses authentication" do
      mock(subject).authorize! :can_edit_sub_objects, workspace
      post :create, csv_file_params
    end

    generate_fixture "csvImport.json" do
      post :create, csv_file_params
    end
  end

  describe "#import" do
    before do
      post :create, csv_file_params
      @csv_file = CsvFile.last
      mock(CsvImporter).import_file.with(@csv_file.id)
    end

    let(:csv_import_params) do
      {
          :delimiter => ',',
          :column_names => ['id', 'name'],
          :types => ['integer', 'varchar'],
          :to_table => "table_importing_into",
          :header => false
      }
    end

    it "updates the necessary import fields on the csv file model" do
      put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
      @csv_file.reload
      @csv_file.delimiter.should == ','
      @csv_file.column_names.should == ['id', 'name']
      @csv_file.types.should == ['integer', 'varchar']
      @csv_file.to_table.should == "table_importing_into"
      @csv_file.header.should == false
      @csv_file.workspace.should == workspace
    end

    it "uses authentication" do
      mock(subject).authorize! :import, @csv_file
      put :import, :workspace_id => workspace.id, :id => @csv_file.id, :csvimport => csv_import_params
    end
  end
end