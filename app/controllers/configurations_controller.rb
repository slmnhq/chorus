require_relative '../../version'

class ConfigurationsController < ApplicationController
  skip_before_filter :require_login, :only => :version

  def show
    render :json => { :response => { :external_auth_enabled => LdapClient.enabled? } }
  end

  def version
    render :inline => Chorus::VERSION::STRING
  end
end
