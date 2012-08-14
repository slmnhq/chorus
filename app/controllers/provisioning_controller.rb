class ProvisioningController < ApplicationController
  def show
    aurora = AuroraProvider.create_from_aurora_service
    present aurora
  end
end