class WorkfileCopyController < ApplicationController

  def create
    workfile = Workfile.find(params[:workfile_id])
    authorize! :can_edit_sub_objects, workfile.workspace

    workspace = Workspace.find(params[:workspace_id])
    authorize! :can_edit_sub_objects, workspace
    copied_workfile = workfile.copy(current_user, workspace)
    WorkfileName.resolve_name_for!(copied_workfile)

    copied_workfile.build_new_version(current_user, workfile.latest_workfile_version.contents, "")
    copied_workfile.save!

    present copied_workfile.reload, :status => :created
  end
end
