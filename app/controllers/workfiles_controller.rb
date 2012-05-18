class WorkfilesController < ApplicationController
  before_filter :load_workspace, :only => [:create]

  def create
    workfile = @workspace.workfiles.build(params[:workfile])
    workfile.owner = current_user
    workfile.save!
    workfile_version = WorkfileVersion.new
    workfile_version.workfile = workfile
    workfile_version.version_num = 1
    workfile_version.commit_message = ""
    workfile_version.owner = current_user
    workfile_version.modifier = current_user
    workfile_version.contents = params[:workfile][:contents][0]
    workfile_version.save!
    head :ok
  end

  private

  def load_workspace
    @workspace = Workspace.writable_by(current_user).find(params[:workspace_id])
  end
end
