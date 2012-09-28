class InsightsController < ApplicationController
  def create
    note = Events::Note.visible_to(current_user).where(id: params[:insight][:note_id]).first
    head(401) and return unless note
    note.insight = true
    note.promoted_by = current_user
    note.promotion_time = Time.now()
    note.save!
    head 201
  end

  def index
    param_hash = params[:insight]
    if param_hash[:entity_type] == "dashboard"
      present Events::Base.visible_to(current_user).where(insight: true)
    elsif param_hash[:entity_type] == "workspace"
      present Events::Base.visible_to(current_user).where(insight: true).where(workspace_id: param_hash[:entity_id])
    end
  end
end