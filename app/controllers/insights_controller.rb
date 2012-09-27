class InsightsController < ApplicationController
  def create
    note = Events::Note.visible_to(current_user).where(id: params[:insight][:note_id]).first
    head(401) and return unless note
    note.insight = true
    note.promoted_by = current_user
    note.save!
    head 201
  end
end