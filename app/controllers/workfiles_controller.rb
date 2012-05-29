class WorkfilesController < ApplicationController
  def show
    workfile = Workfile.find(params[:id])
    workspace = AccessPolicy.workspaces_for(current_user).find(workfile.workspace_id)
    workfile = workspace.workfiles.find(params[:id])
    present workfile
  end

  def create
    file = if params[:workfile][:source] == "empty"
             create_empty_file(params[:workfile][:file_name])
           else
             params[:workfile][:contents]
           end

    present create_workfile(file)
  end

  private

  def create_empty_file(filename)
    ActionDispatch::Http::UploadedFile.new(:filename => filename, :tempfile => Tempfile.new(filename))
  end

  def create_workfile(source_file)
    workspace = Workspace.writable_by(current_user).find(params[:workspace_id])
    workfile = workspace.workfiles.build(params[:workfile])
    workfile.owner = current_user
    workfile.save!

    workfile_version = workfile.versions.create!(
      :owner => current_user,
      :modifier => current_user,
      :contents => source_file,
      :version_num => 1,
      :commit_message => "",
    )

    workfile
  end
end
