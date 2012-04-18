class InstancesController < ApplicationController
  def index
    instances = Instance.all
    present instances
  end
end
