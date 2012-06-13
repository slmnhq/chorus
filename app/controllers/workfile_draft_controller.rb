class WorkfileDraftController < ApplicationController
  def create
    draft = WorkfileDraft.new(params[:draft])
    draft.workfile_id = params[:draft][:workfile_id]
    draft.owner_id = current_user.id
    draft.save!
    present draft, :status => :created
  end

  def show
    draft = WorkfileDraft.find_by_owner_id_and_workfile_id(current_user.id, params[:workfile_id])
    present draft
  end

  def update
    draft = WorkfileDraft.find_by_owner_id_and_workfile_id(current_user.id, params[:workfile_id])
    draft.update_attributes(params[:draft])
    present draft
  end

  def destroy
    draft = WorkfileDraft.find_by_owner_id_and_workfile_id!(current_user.id, params[:workfile_id])
    draft.destroy
    render :json => {}
  end
end