class NoteAttachmentsController < ApplicationController
  def create
    event = Events::Base.find(params[:note_id])
    authorize! :create, NoteAttachment, event

    event.attachments.create!(:contents => params[:fileToUpload][:contents])
    event.reload
    present event
  end

  def show
    attachment = NoteAttachment.find(params[:id])
    send_file(attachment.contents.path(params[:style]), :type => attachment.contents_content_type, :disposition => 'inline')
  end
end
