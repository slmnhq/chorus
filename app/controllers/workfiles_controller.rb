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

    workfile_version = workfile.versions.create!(
      :owner => current_user,
      :modifier => current_user,
      :contents => params[:workfile][:contents],
      :version_num => 1,
      :commit_message => "",
    )

    present workfile
  end
end
