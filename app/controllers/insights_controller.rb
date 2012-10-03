class InsightsController < ApplicationController
  def promote
    note = get_note_if_visible(params[:insight][:note_id])
    raise SecurityTransgression unless note
    note.promote_to_insight(current_user)
    present note, :status => :created
  end

  def index
    params[:entity_type] ||= 'dashboard'
    present get_insights
  end

  def count
    params[:entity_type] ||= 'dashboard'
    insight_count = get_insights.count
    insight_count = insight_count.keys.count unless insight_count.is_a?(Fixnum)
    render :json => {response: { number_of_insight: insight_count } }
  end

  private

  def get_insights
    insight_query = Events::Base.where(insight: true)
    insight_query = insight_query.visible_to(current_user) unless current_user.admin?
    insight_query = insight_query.where(workspace_id: params[:workspace_id]) if params[:entity_type] == "workspace"
    insight_query
  end

   def get_note_if_visible(note_id)
    note_query = Events::Note.where(id: note_id)
    note_query = note_query.visible_to(current_user) unless current_user.admin?
    note_query.first
  end
end
