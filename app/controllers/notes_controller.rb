class NotesController < ApplicationController
  def create
    instance = Instance.find(params[:note][:entity_id])

    Events::NOTE_ON_GREENPLUM_INSTANCE.by(current_user).add(:greenplum_instance => instance, :body => params[:note][:body])
    render :json => {}, :status => :created
  end
end