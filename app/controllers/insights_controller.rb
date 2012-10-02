class InsightsController < ApplicationController
  def create
    note = get_note_if_visible
    raise SecurityTransgression unless note
    note.promote_to_insight(current_user)
    present note, :status => :created
  end

  def index
    params[:entity_type] ||= 'dashboard'
    event_query = Events::Base.where(insight: true)
    event_query = event_query.visible_to(current_user) unless current_user.admin?
    event_query = event_query.where(workspace_id: params[:entity_id]) if params[:entity_type] == "workspace"
    present event_query
  end

  private
  def get_note_if_visible
    note_query = Events::Note.where(id: params[:insight][:note_id])
    note_query = note_query.visible_to(current_user) unless current_user.admin?
    note_query.first
  end
end