require "spec_helper"

describe UserImagesController do
  let(:user) { users(:no_picture) }

  before do
    log_in user
    any_instance_of(User) do |any_user|
      stub(any_user).save_attached_files { true }
    end
  end

  describe "#create" do
    context("for User") do
      let(:files) { [Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/small1.gif", Rails.root), "image/gif")] }

      it "returns success" do
        post :create, :user_id => user.id, :files => files
        response.should be_success
      end

      it "updates the user's image" do
        default_image_path = "/images/default-user-icon.png"
        user.image.url.should == default_image_path
        post :create, :user_id => user.id, :files => files
        user.reload
        user.image.url.should_not == default_image_path
      end

      it "responds with the urls of the new image" do
        post :create, :user_id => user.id, :files => files
        user.reload
        decoded_response.original.should == user.image.url(:original)
        decoded_response.icon.should == user.image.url(:icon)
      end

      generate_fixture "image.json" do
        post :create, :user_id => user.id, :files => files
      end
    end
  end

  describe "#show" do
    let(:user) { users(:with_picture) }

    it "uses send_file" do
      mock(controller).send_file(user.image.path('original'), :type => user.image_content_type) {
        controller.head :ok
      }
      get :show, :user_id => user.id
      response.code.should == "200"
      decoded_response.type == "image/gif"
    end

    context "when no image exists for the user" do
      it "responds with a 404" do
        get :show, :user_id => users(:admin)
        response.code.should == "404"
      end
    end
  end
end
