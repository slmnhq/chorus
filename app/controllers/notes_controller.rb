require Rails.root + 'app/permissions/note_access'

class NotesController < ApplicationController
  def create
    note_params = params[:note]
    entity_type = note_params[:entity_type]
    entity_id = note_params[:entity_id]
    authorize! :create, Events::Note, entity_type, entity_id
    note = Events::Note.create_from_params(note_params, current_user)

    if note_params[:recipients]
      note_params[:recipients].each do |recipient_id|
        notification = Notification.new
        notification.recipient_id = recipient_id
        notification.event_id = note.id
        notification.save!
      end
    end

    present note, :status => :created
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
