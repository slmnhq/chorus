class ActivitiesController < ApplicationController
  def index
    present activities
  end

  def show
    present activities.find(params[:id])
  end

  private

  def activities
    if (entity = get_parent_entity)
      entity.activities
    else
      Activity.global
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
