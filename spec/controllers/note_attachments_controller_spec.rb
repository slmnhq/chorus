require 'spec_helper'

describe NoteAttachmentsController do
  ignore_authorization!
  let(:user) { users(:bob) }

  before do
    log_in user
  end

  context "#create" do
    it "changes the file content" do
      event = Events::NoteOnGreenplumInstance.first
      file = test_file('workfile.sql')
      post :create, :note_id => event.id, :fileToUpload => {:contents => file}
      response.code.should == '200'
      event.reload
      decoded_response[:attachments][0][:name].should == 'workfile.sql'
    end
  end

  describe "#show" do
    let(:attachment) { note_attachments(:image) }

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
