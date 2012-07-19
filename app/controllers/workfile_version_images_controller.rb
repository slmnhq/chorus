class WorkfileVersionImagesController < ApplicationController

  def show
    style = params[:style] ? params[:style] : 'original'
    workfile = WorkfileVersion.find(params[:workfile_version_id])
    content_type = workfile.contents_content_type
    file_path = workfile.contents.path(style)
    send_file file_path, :type => content_type
  end
end