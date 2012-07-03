class EventsController < ApplicationController
  def index
    entity_type = params[:entity_type]
    if entity_type == "dashboard" then
      present Events::Base.for_dashboard_of(current_user)
    else
      begin
        klass = entity_type.classify.constantize
        present klass.find(params[:entity_id]).events
      rescue Exception => e
        head :not_found
      end
    end
  end

  def show
    present Events::Base.find(params[:id])
  end
end
