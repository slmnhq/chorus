require 'spec_helper'
require './spec/acceptance/image_hack'

resource "Workspaces" do
  let!(:user) { FactoryGirl.create :admin }
  let!(:workspace) { FactoryGirl.create :workspace, :owner => user }

  before do
    log_in user
  end

  put "/workspaces/:workspace_id/image" do
    parameter :files, "Picture file"

    let(:workspace_id) { workspace.to_param }
    let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small2.png", Rails.root), "image/png")] }

    example_request "Update a workspace image" do
      status.should == 200
    end
  end
end
