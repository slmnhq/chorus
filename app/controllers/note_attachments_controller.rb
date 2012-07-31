class NoteAttachmentsController < ApplicationController
  def create
    event = Events::Base.find(params[:note_id])
    authorize! :create, NoteAttachment, event

    file_to_upload = params[:fileToUpload][:contents]
    filename = file_to_upload.original_filename
    contents = params[:fileToUpload][:contents]
    file = build_new_file(filename, contents)
    event.create_attachments(file)
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
