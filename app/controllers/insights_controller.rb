class InsightsController < ApplicationController
  def create
    note = Events::Note.visible_to(current_user).where(id: params[:insight][:note_id]).first
    head(401) and return unless note
    note.promote_to_insight(current_user)
    present note, :status => :created
  end

  def index
    param_hash = params[:insight]
    events = Events::Base.visible_to(current_user).where(insight: true)
    events = events.where(workspace_id: param_hash[:entity_id]) if param_hash[:entity_type] == "workspace"
    present events
  end
end