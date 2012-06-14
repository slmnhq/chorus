class WorkfileCopyController < ApplicationController

  def create
    workfile = Workfile.find(params[:workfile_id])
    authorize! :workfile_change, workfile.workspace

    workspace = Workspace.find(params[:workspace_id])
    authorize! :workfile_change, workspace
    copied_workfile = workfile.copy(current_user, workspace)
    WorkfileName.resolve_name_for!(copied_workfile)

    copied_workfile.save!

    copied_workfile.create_new_version(current_user, workfile.last_version.contents, "")

    present copied_workfile
  end
end