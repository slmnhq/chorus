class WorkfileVersionsController < ApplicationController
  wrap_parameters :workfile, :exclude => []

  def update
    workfile = Workfile.find(params[:workfile_id])
    authorize! :can_edit_sub_objects, workfile.workspace
    workfile_version = workfile.versions.find(params[:id])
    workfile_version.update_content(params[:workfile][:content])
    remove_draft(workfile)

    present workfile.latest_workfile_version
  end

  def create
    workfile = Workfile.find(params[:workfile_id])
    authorize! :can_edit_sub_objects, workfile.workspace
    file = build_new_file(workfile.file_name, params[:workfile][:content])
    file.content_type = workfile.latest_workfile_version.contents_content_type
    Workfile.transaction do
      workfile_version = workfile.build_new_version(current_user, file, params[:workfile][:commit_message])
      workfile_version.save!
      create_event_for_upgrade(current_user, workfile, workfile.workspace,
                               workfile_version.version_num, workfile_version.commit_message, workfile_version.id)
      remove_draft(workfile)
    end

    workfile.reload
    present workfile.latest_workfile_version, :presenter_options => { :contents => true }
  end

  def show
    workfile = Workfile.find(params[:workfile_id])
    authorize! :show, workfile.workspace

    workfile_version = WorkfileVersion.find(params[:id])
    present workfile_version, :presenter_options => {:contents => true}
  end

  def index
    workfile = Workfile.find(params[:workfile_id])
    authorize! :show, workfile.workspace

    present paginate(workfile.versions)
  end

  def destroy
    workfile = Workfile.find(params[:workfile_id])
    authorize! :can_edit_sub_objects, workfile.workspace
    workfile_versions = workfile.versions
    version_num = WorkfileVersion.find(params[:id]).version_num

    Workfile.transaction do
      if workfile_versions.length == 1
        raise ApiValidationError.new(:base, :only_one_version)
      elsif workfile.latest_workfile_version_id == params[:id].to_i
        WorkfileVersion.find(params[:id]).destroy
        workfile.update_attributes!({:latest_workfile_version_id => workfile_versions[1].id}, :without_protection => true)
      else
        WorkfileVersion.find(params[:id]).destroy
      end

      Events::WorkfileVersionDeleted.by(current_user).add(
          :workfile => workfile,
          :workspace => workfile.workspace,
          :version_num => version_num
      )

    end

    render :json => {}
  end

  private

  def remove_draft(workfile)
    draft = WorkfileDraft.find_by_owner_id_and_workfile_id(current_user.id, workfile.id)
    draft.destroy if draft
  end

  def build_new_file(file_name, content)
    tempfile = Tempfile.new(file_name)
    tempfile.write(content)
    tempfile.close

    ActionDispatch::Http::UploadedFile.new(:filename => file_name, :tempfile => tempfile)
  end

  def create_event_for_upgrade(current_user, workfile, workspace, version_num, commit_message, version_id)
    Events::WorkfileUpgradedVersion.by(current_user).add(
        :workfile => workfile,
        :workspace => workspace,
        :version_num => version_num.to_s,
        :commit_message => commit_message,
        :version_id => version_id.to_s
    )
  end
end
