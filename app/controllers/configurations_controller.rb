class ConfigurationsController < ApplicationController
  def show
    render :json => { :response => { :external_auth_enabled => LdapClient.enabled? } }
  end
end
