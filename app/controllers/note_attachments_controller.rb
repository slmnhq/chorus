class NoteAttachmentsController < ApplicationController
  def create
    event = Events::Base.find(params[:note_id])
    authorize! :create, NoteAttachment, event

    if params[:contents]
      attachment_content = params[:contents]
    else
      transcoder = SvgToPng.new(params[:svg_data])
      attachment_content = transcoder.fake_uploaded_file(params[:file_name])
    end
    event.attachments.create!(:contents => attachment_content)
    event.reload
    present event
  end

  def show
    attachment = NoteAttachment.find(params[:id])
    send_file(attachment.contents.path(params[:style]), :type => attachment.contents_content_type, :disposition => 'inline')
  end
end
