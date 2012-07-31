require 'spec_helper'

describe AttachmentDownloadsController do

  let(:user) { users(:carly) }

  before do
    log_in user
  end

  context "#show" do

    context "download" do
      it "the file" do
        attachment = NoteAttachment.first
        get :show, :attachment_id => attachment.id

        response.headers['Content-Disposition'].should include("attachment")
        response.headers['Content-Disposition'].should include('filename="workfile.sql"')
        response.headers['Content-Type'].should == 'application/octet-stream'
      end
    end
  end
end
