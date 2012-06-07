class ActivitiesController < ApplicationController
  def index
    activities = entity.activities
    present activities
  end

  def entity
    Instance.find(params[:instance_id])
  end
end
