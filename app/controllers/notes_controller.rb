require Rails.root + 'app/permissions/note_access'

class NotesController < ApplicationController
  def create
    Events::Note.create_from_params(params[:note], current_user)
    render :json => {}, :status => :created
  end

  def update
    note = Events::Base.find(params[:id])
    authorize! :update, note
    note.body = params[:note][:body]
    note.save!
    present note
  end

  def destroy
    note = Events::Base.find(params[:id])
    authorize! :destroy, note
    note.destroy
    render :json => {}
  end
end
