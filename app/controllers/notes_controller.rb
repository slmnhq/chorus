require Rails.root + 'app/permissions/note_access'

class NotesController < ApplicationController
  include ActionView::Helpers::SanitizeHelper

  def create
    note_params = params[:note]
    entity_type = note_params[:entity_type]
    entity_id = note_params[:entity_id]
    authorize! :create, Events::Note, entity_type, entity_id
    note_params[:body] = sanitize(note_params[:body])

    note = Events::Note.create_from_params(note_params, current_user)

    if note_params[:recipients]
      note_params[:recipients].each do |recipient_id|
        Notification.create!(:recipient_id => recipient_id, :event_id => note.id)
      end
    end

    present note, :status => :created
  end

  def update
    note = Events::Base.find(params[:id])
    authorize! :update, note
    note.update_attributes!(:body => sanitize(params[:note][:body]))
    present note
  end

  def destroy
    note = Events::Base.find(params[:id])
    authorize! :destroy, note
    note.destroy
    render :json => {}
  end
end
