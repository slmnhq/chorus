class NoteAttachmentsController < ApplicationController
  def create
    event = Events::Base.find(params[:note_id])
    authorize! :create, NoteAttachment, event

    event.create_attachments(params[:fileToUpload][:contents])
    event.reload
    present event
  end

  private
  def build_new_file(file_name, content)
    tempfile = Tempfile.new(file_name)
    tempfile.write(content)
    tempfile.close

    ActionDispatch::Http::UploadedFile.new(:filename => file_name, :tempfile => tempfile)
  end
end
