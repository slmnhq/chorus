require 'spec_helper'

describe NoteAttachmentsController do
  ignore_authorization!
  let(:user) { FactoryGirl.create(:user) }

  before do
    log_in user
  end

  context "#create" do
    it "changes the file content" do
      event = Events::NOTE_ON_GREENPLUM_INSTANCE.first
      file = test_file('not_an_image.jpg')
      post :create, :note_id => event.id, :fileToUpload => {:contents => file, :file_name => 'not_an_image.jpg'}
      event.reload
      decoded_response[:attachments][0][:file_name].should == 'not_an_image.jpg'
    end
  end
end
