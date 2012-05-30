class WorkfilesController < ApplicationController
  def show
    workfile = Workfile.find(params[:id])
    AccessPolicy.workspaces_for(current_user).find(workfile.workspace_id)
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

  def index
    workspace = Workspace.find(params[:workspace_id])
    authorize! :show, workspace
    sort_column = params[:order] ? (params[:order] == "file_name" ? "lower(file_name)" : "updated_at") : "lower(file_name)"
    workfiles = workspace.workfiles.order("#{sort_column} ASC")
    present workfiles.paginate(params.slice(:page, :per_page))
  end

  private

  def create_empty_file(filename)
    ActionDispatch::Http::UploadedFile.new(:filename => filename, :tempfile => Tempfile.new(filename))
  end

  def create_workfile(source_file)
    workspace = Workspace.writable_by(current_user).find(params[:workspace_id])
    workfile = workspace.workfiles.build(params[:workfile])
    workfile.file_name ||= source_file.original_filename
    workfile.owner = current_user
    workfile.save!

    workfile.versions.create!(
      :owner => current_user,
      :modifier => current_user,
      :contents => source_file,
      :version_num => 1,
      :commit_message => "",
    )

    workfile
  end
end
