class WorkfilesController < ApplicationController
  def show
    workfile = Workfile.find(params[:id])
    workspace = AccessPolicy.workspaces_for(current_user).find(workfile.workspace_id)
    workfile = workspace.workfiles.find(params[:id])
    present workfile
  end

  def create
    workspace = Workspace.writable_by(current_user).find(params[:workspace_id])
    workfile = workspace.workfiles.build(params[:workfile])
    workfile.owner = current_user
    workfile.save!
    workfile_version = WorkfileVersion.new
    workfile_version.workfile = workfile
    workfile_version.version_num = 1
    workfile_version.commit_message = ""
    workfile_version.owner = current_user
    workfile_version.modifier = current_user
    workfile_version.contents = params[:workfile][:contents]
    workfile_version.save!
    present workfile
  end
end
