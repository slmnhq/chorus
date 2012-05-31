require 'will_paginate/array'

class WorkfilesController < ApplicationController
  def show
    workfile = Workfile.find(params[:id])
    authorize! :show, workfile.workspace
    present workfile
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :workfile_change, workspace

    present create_workfile(workspace, uploaded_file)
  end

  def index
    workspace = Workspace.find(params[:workspace_id])
    authorize! :show, workspace

    workfiles = workspace.workfiles.order(workfile_sort(params[:order]))
    workfiles = workfiles.by_type(params[:file_type]) if params.has_key?(:file_type)

    present workfiles.paginate(params.slice(:page, :per_page))
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
      create_empty_file(params[:workfile][:file_name])
    else
      params[:workfile][:contents]
    end
  end

  def create_empty_file(filename)
    ActionDispatch::Http::UploadedFile.new(:filename => filename, :tempfile => Tempfile.new(filename))
  end

  def create_workfile(workspace, source_file)
    workfile = workspace.workfiles.build(params[:workfile])
    workfile.file_name ||= source_file.original_filename

    WorkfileName.resolve_name_for!(workfile)

    workfile.owner = current_user
    workfile.save!

    workfile.create_new_version(current_user, source_file, "")

    workfile
  end
end
