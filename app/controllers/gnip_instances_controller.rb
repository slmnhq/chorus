class GnipInstancesController < ApplicationController
  def create
    gnip_params = params[:gnip_instance]
    chorus_gnip = ChorusGnip.new({:url => gnip_params[:stream_url],
                                  :username => gnip_params[:username],
                                  :password => gnip_params[:password]
                                 })
    if chorus_gnip.auth
      current_user.gnip_instances.create!(gnip_params, current_user)
      render :json => {}, :status => :created
    else
      raise ApiValidationError.new(:connection, :generic, {:message => "Url, username and password combination is Invalid"})
    end
  end

  def index
    present GnipInstance.all
  end

  def show
    present GnipInstance.find(params[:id])
  end
end