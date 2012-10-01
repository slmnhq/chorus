class InsightsController < ApplicationController
  def create
    note = get_note_if_visible
    raise SecurityTransgression unless note
    note.promote_to_insight(current_user)
    present note, :status => :created
  end

  def index
    param_hash = params[:insight]
    events = Events::Base.visible_to(current_user).where(insight: true)
    events = events.where(workspace_id: param_hash[:entity_id]) if param_hash[:entity_type] == "workspace"
    present events
  end

  private
  def get_note_if_visible
    note_query = Events::Note.where(id: params[:insight][:note_id])
    note_query = note_query.visible_to(current_user) unless current_user.admin?
    note_query.first
  end
end