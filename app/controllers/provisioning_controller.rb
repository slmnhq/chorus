class ProvisioningController < ApplicationController
  def show
    aurora = AuroraProvider.create_from_aurora_service
    present aurora
  end

  def create
    aurora = AuroraProvider.create_from_aurora_service
    aurora.provide!(params[:provision], current_user)

    head :created
  end
end