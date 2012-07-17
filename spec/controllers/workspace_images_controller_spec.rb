require "spec_helper"

describe WorkspaceImagesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
    any_instance_of(Workspace) do |workspace|
      stub(workspace).save_attached_files { true }
    end
  end

  describe "#update" do
    context "for Workspace" do
      before do
        @workspace = FactoryGirl.create(:workspace)
      end

      let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small1.gif", Rails.root), "image/gif")] }

      it "updates the workspace's image" do
        default_image_path = "/images/original/missing.png"
        @workspace.image.url.should == ""
        post :create, :workspace_id => @workspace.id, :files => files
        @workspace.reload
        @workspace.image.url.should_not == default_image_path
      end

      it "responds with the urls of the new image" do
        post :create, :workspace_id => @workspace.id, :files => files
        @workspace.reload
        response.code.should == "200"
        decoded_response.original.should == @workspace.image.url(:original)
        decoded_response.icon.should == @workspace.image.url(:icon)
      end
    end
  end

  describe "#show" do
    before do
      @workspace = FactoryGirl.create(:workspace, :image => test_file('small1.gif'))
      stub(File).binread(@workspace.image.path("original")) {
        "Hi!"
      }
    end

    it "responds with the urls of the image" do
      get :show, :workspace_id => @workspace.id
      response.code.should == "200"
      decoded_response.type == "image/gif"
    end
  end
end
