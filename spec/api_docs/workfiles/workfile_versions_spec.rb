require 'spec_helper'

resource "Workfiles: versions" do
  let(:owner) { users(:owner) }
  let!(:workspace) { workspaces(:public) }
  let!(:workfile) { workfiles(:public)}
  let!(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_version) { workfile_versions(:public) }
  let!(:workfile_id) { workfile.to_param }

  before do
    log_in owner
    workfile_version.tap { |v|
      v.contents = file
      v.save!
    }
  end

  get "/workfiles/:workfile_id/versions" do
    let!(:workfile_id) { workfile.to_param }

    parameter :workfile_id, "Workfile id to which the version belongs"
    pagination

    required_parameters :workfile_id

    example_request "Get a list of all versions of a workfile" do
      status.should == 200
    end
  end

  get "/workfiles/:workfile_id/versions/:id" do
    let!(:id) { workfile_version.to_param }
    let!(:workfile_id) { workfile.to_param }

    parameter :workfile_id, "Workfile id to which the version belongs"
    parameter :id, "Workfile version's id'"

    required_parameters :workfile_id, :id

    example_request "Get a version of a workfile" do
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

    let(:owner_id) { owner.to_param }
    let(:commit_message) { "Hey there, Billy" }
    let(:modifier_id) { owner.to_param }
    let(:content) { workfile_version.contents }

    example_request "Update a version of a workfile" do
      status.should == 200
    end
  end

  post "/workfiles/:workfile_id/versions" do
    parameter :owner_id, "Workfile owner"
    parameter :commit_message, "Commit message"
    parameter :modifier_id, "Workfile modifier"
    parameter :content, "Content of the file"

    required_parameters :owner_id

    let(:owner_id) { owner.to_param }
    let(:commit_message) { "Get off my lawn, you darn kids!" }
    let(:modifier_id) { owner.to_param }
    let(:content) { workfile_version.contents }

    example_request "Create a new version of a workfile" do
      status.should == 200
    end
  end

  get "/workfile_versions/:workfile_version_id/image" do
    parameter :workfile_version_id, "Workfile version id"
    required_parameters :workfile_version_id

    let!(:workfile_version_id) { workfile_version.to_param }
    let!(:file) { test_file("small1.gif", "image/gif") }

    example_request "Get the image for a version of a workfile" do
      status.should == 200
    end
  end

  delete "/workfiles/:workfile_id/versions/:id" do
    let!(:another_version) { workfile.build_new_version(owner, test_file('some.txt'), "commit message - 1")}
    let!(:id) { another_version.to_param }


    example_request "Delete a version of a workfile" do
      status.should == 200
    end
  end
end
