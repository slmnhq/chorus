require 'spec_helper'

describe WorkspaceCsvController do
  ignore_authorization!

  let(:user) { users(:owner) }
  let(:non_auth_user) { users(:no_collaborators) }
  let(:file) { test_file("test.csv", "text/csv") }
  let(:workspace) { workspaces(:public) }
  let(:truncate) { false }

  before do
    log_in user
  end

  describe "#create" do
    let(:csv_file_params) do
      {
          :workspace_id => workspace.to_param,
          :contents => file,
          :truncate => truncate
      }
    end

    it "saves the user and workspace onto the csv file" do
      post :create, csv_file_params
      csv_file = CsvFile.last
      csv_file.user.should == user
      csv_file.workspace.should == workspace
    end

    context "when truncate is set to true" do
      let(:truncate) { true }
      it "saves the setting onto the csv file" do
        post :create, csv_file_params
        csv_file = CsvFile.last
        csv_file.truncate.should be_true
      end
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
end