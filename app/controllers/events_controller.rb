class EventsController < ApplicationController
  def index
    events = if params[:entity_type] == "dashboard"
       Events::Base.for_dashboard_of(current_user).includes([:actor, :target1, :target2, {:workspace => {:sandbox => :database}}])
     elsif params[:entity_type] == "user"
       ModelMap.model_from_params(params[:entity_type], params[:entity_id]).accessible_events(current_user).includes(:actor, :target1, :target2)
     else
       ModelMap.model_from_params(params[:entity_type], params[:entity_id]).events.includes(:actor, :target1, :target2)
     end
    present events
  end

  def show
    present Events::Base.for_dashboard_of(current_user).find(params[:id])
  end
end
