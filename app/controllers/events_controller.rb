class EventsController < ApplicationController
  def index
    present events
  end

  def show
    present events.find(params[:id])
  end

  private

  def events
    if (entity = get_parent_entity)
      entity.events
    else
      Events::Base.for_dashboard_of(current_user)
    end
  end

  def get_parent_entity
    id_key = params.keys.find { |key| key =~ /\w+_id/ }

    if id_key
      id = params[id_key]
      klass = id_key.gsub(/_id$/, '').classify.constantize
      klass.find(id)
    end
  end
end
