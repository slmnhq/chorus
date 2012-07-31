class AttachmentDownloadsController < ApplicationController

  def show
    #authorize! :show, attachment.note
    download_file(params[:attachment_id])
  end

  private

  def download_file(attachment_id)
    attachment = NoteAttachment.find(attachment_id)

    send_file attachment.contents.path,
              :disposition => 'attachment'
  end
end
