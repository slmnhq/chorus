require "spec_helper"

describe WorkspaceImagesController do
  before do
    any_instance_of(Workspace) do |workspace|
      stub(workspace).save_attached_files { true }
    end
  end

  describe "#update" do
    context "for Workspace" do
      before do
        @user = FactoryGirl.create(:user)
        @workspace = FactoryGirl.create(:workspace)
        log_in @user
      end

      let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small1.gif", Rails.root), "image/gif")] }

      it "updates the workspace's image" do
        default_image_path = "/images/original/missing.png"
        @workspace.image.url.should == ""
        put :update, :id => @workspace.id, :files => files
        @workspace.reload
        @workspace.image.url.should_not == default_image_path
      end

      it "responds with the urls of the new image" do
        put :update, :id => @workspace.id, :files => files
        @workspace.reload
        response.code.should == "200"
        decoded_response.original.should == @workspace.image.url(:original)
        decoded_response.icon.should == @workspace.image.url(:icon)
      end
    end
  end
end
