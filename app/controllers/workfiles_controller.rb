require 'will_paginate/array'

class WorkfilesController < ApplicationController
  def show
    workfile = Workfile.find(params[:id])
    authorize! :show, workfile.workspace
    present workfile.last_version
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :can_edit_sub_objects, workspace

    present create_workfile(workspace, uploaded_file).last_version
  end

  def index
    workspace = Workspace.find(params[:workspace_id])
    authorize! :show, workspace

    workfiles = workspace.workfiles.order(workfile_sort(params[:order]))
    workfiles = workfiles.by_type(params[:file_type]) if params.has_key?(:file_type)

    workfile_versions = workfiles.map(&:last_version)

    present paginate(workfile_versions)
  end

  def destroy
    workfile = Workfile.find(params[:id])
    authorize! :can_edit_sub_objects,  workfile.workspace

    workfile.destroy
    render :json => {}
  end

  private

  def workfile_sort(column_name)
    if column_name.blank? || column_name == "file_name"
      "lower(file_name)"
    else
      "updated_at"
    end
  end

  def uploaded_file
    if params[:workfile][:source] == "empty"
      create_sql_file(params[:workfile][:file_name])
    else
      params[:workfile][:contents]
    end
  end

  def create_sql_file(filename)
    ActionDispatch::Http::UploadedFile.new(:filename => filename, :tempfile => Tempfile.new(filename))
  end

  def create_workfile(workspace, source_file)
    workfile = workspace.workfiles.build(params[:workfile])

    workfile.file_name ||= source_file.original_filename
    workfile.owner = current_user
    workfile.build_new_version(current_user, source_file, "")

    workfile.save!


    Events::WORKFILE_CREATED.by(current_user).add(
      :workfile => workfile,
      :workspace => workspace
    )

    workspace.has_added_workfile = true
    workspace.save!

    workfile
  end
end
