require 'spec_helper'
require './spec/api_docs/image_hack'

resource "Workspaces" do
  let(:user) { users(:admin) }
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.to_param }

  before do
    log_in user
  end

  get "/workspaces/:workspace_id/image" do
    parameter :workspace_id, "Id of a workspace"

    required_parameters :workspace_id

    let(:workspace) { workspaces(:image) }
    parameter :style, "Size of image ( original, icon )"

    example_request "Get the workspace image" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/image" do
    parameter :workspace_id, "Id of a workspace"

    required_parameters :workspace_id
    parameter :files, "Image file"

    let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small2.png", Rails.root), "image/png")] }

    example_request "Update a workspace image" do
      status.should == 200
    end
  end
end
