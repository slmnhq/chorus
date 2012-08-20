require 'spec_helper'

resource "Workfile versions" do
  let!(:owner) { users(:bob) }
  let!(:workspace) { FactoryGirl.create(:workspace, :owner => owner) }
  let!(:workfile) { FactoryGirl.create(:workfile, :owner => owner, :workspace => workspace, :file_name => 'test.sql') }
  let!(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_version) { FactoryGirl.create(:workfile_version, :workfile => workfile, :contents => file, :owner => owner) }
  let!(:workfile_id) { workfile.to_param }

  before do
    log_in owner
  end

  get "/workfiles/:workfile_id/versions" do
    let!(:workfile_id) { workfile.to_param }

    parameter :workfile_id, "Workfile id to which the version belongs"

    required_parameters :workfile_id

    example_request "Show all workfile versions" do
      status.should == 200
    end
  end

  get "/workfiles/:workfile_id/versions/:id" do
    let!(:id) { workfile_version.to_param }
    let!(:workfile_id) { workfile.to_param }

    parameter :workfile_id, "Workfile id to which the version belongs"
    parameter :id, "Workfile version's id'"

    required_parameters :workfile_id, :id

    example_request "Show the specified workfile version" do
      status.should == 200
    end
  end

  put "/workfiles/:workfile_id/versions/:id" do
    let!(:id) { workfile_version.to_param }

    parameter :owner_id, "Workfile owner"
    parameter :commit_message, "Commit message"
    parameter :modifier_id, "Workfile modifier"
    parameter :content, "Content of the file"

    required_parameters :owner_id
    scope_parameters :workfile, :all

    let(:owner_id) { owner.to_param }
    let(:commit_message) { "Hey there, Billy" }
    let(:modifier_id) { owner.to_param }
    let(:content) { workfile_version.contents }

    example_request "Update workfile version" do
      status.should == 200
    end
  end

  post "/workfiles/:workfile_id/versions" do
    parameter :owner_id, "Workfile owner"
    parameter :commit_message, "Commit message"
    parameter :modifier_id, "Workfile modifier"
    parameter :content, "Content of the file"

    required_parameters :owner_id
    scope_parameters :workfile, :all

    let(:owner_id) { owner.to_param }
    let(:commit_message) { "Get off my lawn, you darn kids!" }
    let(:modifier_id) { owner.to_param }
    let(:content) { workfile_version.contents }

    example_request "Create a workfile version" do
      status.should == 200
    end
  end

  get "/workfile_versions/:workfile_version_id/image" do
    parameter :workfile_version_id, "Workfile version id"
    required_parameters :workfile_version_id

    let!(:workfile_version_id) { workfile_version.to_param }
    let!(:file) { test_file("small1.gif", "image/gif") }

    example_request "Show a workfile version image" do
      status.should == 200
    end
  end
end
