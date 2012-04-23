class InstancesController < ApplicationController
  before_filter :load_instance, :only => :update

  def index
    present Instance.scoped
  end

  def create
    instance = Gpdb::Instance.create(params[:instance], current_user)
    present instance, :status => :created
  end

  def update
    head(:unauthorized) and return unless current_user.admin? || current_user == @instance.owner
    @instance.attributes = params[:instance]
    @instance.save!
    present @instance
  end

  private

  def load_instance
    @instance = Instance.find_by_id(params[:id])
    head(:not_found) unless @instance
  end
end
