class EventsController < ApplicationController
  def index
    events = if params[:entity_type] == "dashboard"
      Events::Base.for_dashboard_of(current_user)
    else
      ModelMap.model_from_params(params[:entity_type], params[:entity_id]).events
    end
    present events
  end

  def show
    present Events::Base.for_dashboard_of(current_user).find(params[:id])
  end
end
