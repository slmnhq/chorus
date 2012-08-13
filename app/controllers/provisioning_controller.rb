require 'aurora/service'

class ProvisioningController < ApplicationController
  def show
    aurora = AuroraProvider.new(Aurora::Service.new(Rails.root.join('config', 'aurora.properties')))
    present aurora
  end
end