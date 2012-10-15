require 'spec_helper'

describe AttachmentsController do
  ignore_authorization!
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  context "#create" do
    let(:event) { Events::NoteOnGreenplumInstance.last }

    context "with a binary file" do
      it "changes the file content" do
        file = test_file('workfile.sql')
        post :create, :note_id => event.id, :contents => file
        response.code.should == '200'
        decoded_response[:attachments][0][:name].should == 'workfile.sql'
      end
    end

    context "with a svg visualization" do
      it "converts the svg to a png file" do
        post :create, :note_id => event.id, :file_name => "new_visualization.png", :svg_data => '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
        response.should be_success
        decoded_response[:attachments][0][:name].should == 'new_visualization.png'
      end
    end
  end

  describe "#show" do
    let(:attachment) { attachments(:image) }

    it "uses send_file" do
      mock(controller).send_file(attachment.contents.path('icon'), :type => attachment.contents_content_type, :disposition => 'inline') {
        controller.head :ok
      }
      get :show, :note_id => attachment.note.to_param, :id => attachment.to_param, :style => 'icon'
      response.code.should == "200"
      decoded_response.type == "image/gif"
    end
  end
end
