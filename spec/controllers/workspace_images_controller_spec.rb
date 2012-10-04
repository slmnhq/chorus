require "spec_helper"

describe WorkspaceImagesController do
  before do
    @user = users(:owner)
    log_in @user
    any_instance_of(Workspace) do |workspace|
      stub(workspace).save_attached_files { true }
    end
  end

  describe "#create" do
    context "for Workspace" do
      let(:workspace) { workspaces(:public) }
      let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small1.gif", Rails.root), "image/gif")] }

      it "adds the workspace's image" do
        default_image_path = "/images/original/missing.png"
        workspace.image.url.should == ""
        post :create, :workspace_id => workspace.id, :files => files
        workspace.reload
        workspace.image.url.should_not == default_image_path
      end

      it "responds with the urls of the new image" do
        post :create, :workspace_id => workspace.id, :files => files
        workspace.reload
        response.code.should == "200"
        decoded_response.original.should == workspace.image.url(:original)
        decoded_response.icon.should == workspace.image.url(:icon)
      end
    end
  end

  describe "#show" do
    let(:workspace) { workspaces(:image) }

    it "responds with the urls of the image" do
      mock(controller).send_file(workspace.image.path('original'), :type => workspace.image_content_type) {
        controller.head :ok
      }
      get :show, :workspace_id => workspace.id
      response.code.should == "200"
      decoded_response.type == "image/jpg"
    end
  end
end
