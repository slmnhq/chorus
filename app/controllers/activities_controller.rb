class ActivitiesController < ApplicationController
  def index
    present activities
  end

  def activities
    if (entity = parent_entity)
      entity.activities
    else
      Activity.global
    end
  end

  def parent_entity
    id_key = params.keys.find { |key| key =~ /\w+_id/ }

    case id_key
    when "instance_id"
      Instance.find(params[:instance_id])
    when "user_id"
      User.find(params[:user_id])
    end
  end
end
