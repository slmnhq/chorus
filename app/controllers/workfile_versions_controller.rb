class WorkfileVersionsController < ApplicationController
  def update
    workfile = Workfile.find(params[:workfile_id])
    authorize! :workfile_change,  workfile.workspace
    workfile_version = workfile.versions.find_by_version_num(params[:id])
    workfile_version.update_content(params[:workfile][:content])
    present workfile_version
  end

  def create
    workfile = Workfile.find(params[:workfile_id])
    authorize! :workfile_change,  workfile.workspace
    file = build_new_file(workfile.file_name, params[:workfile][:content])
    file.content_type = workfile.last_version.contents_content_type

    present workfile.create_new_version(current_user, file, params[:workfile][:commit_message])
  end

  private

  def build_new_file(file_name, content)
    tempfile = Tempfile.new(file_name)
    tempfile.write(content)
    tempfile.close

    ActionDispatch::Http::UploadedFile.new(:filename => file_name, :tempfile => tempfile)
  end
end