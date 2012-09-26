class InsightsController < ApplicationController
  def create
    note = Events::Note.visible_to(current_user).where(id: params[:insight][:note_id]).first
    head(401) and return unless note
    if note.is_a?(Events::NoteOnWorkspace)
      head 422
    else
      note.insight = true
      note.promoted_by = current_user
      note.save!
      head 201
    end
  end
end