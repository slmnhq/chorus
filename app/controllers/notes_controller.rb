require Rails.root + 'app/permissions/note_access'

class NotesController < ApplicationController
  def create
    note_params = params[:note]
    Events::Note.create_for_entity(note_params[:entity_type], note_params[:entity_id], note_params[:body], current_user)
    render :json => {}, :status => :created
  end

  def update
    note = Events::Base.find(params[:id])
    authorize! :update, note
    note.body = params[:note][:body]
    note.save!
    present note
  end
end
