require_relative '../../version'
require 'ldap_client'

class ConfigurationsController < ApplicationController
  skip_before_filter :require_login, :only => :version

  def show
    render :json => { :response => {
      :external_auth_enabled => LdapClient.enabled?,
      :gpfdist_configured => Chorus::Application.config.chorus.gpfdist_configured?,
      :tableau_configured => Chorus::Application.config.chorus.tableau_configured?,
      :file_sizes_mb_workfiles => Chorus::Application.config.chorus['file_sizes_mb.workfiles'],
      :file_sizes_mb_csv_imports => Chorus::Application.config.chorus['file_sizes_mb.csv_imports'],
      :file_sizes_mb_user_icon => Chorus::Application.config.chorus['file_sizes_mb.user_icon'],
      :file_sizes_mb_workspace_icon => Chorus::Application.config.chorus['file_sizes_mb.workspace_icon'],
      :file_sizes_mb_attachment => Chorus::Application.config.chorus['file_sizes_mb.attachment'],
      :timezone_offset => Chorus::Application.config.chorus['timezone_offset'],
      :provision_max_size_in_gb => Chorus::Application.config.chorus['provision_max_size_in_gb'],
      :kaggle_configured => Chorus::Application.config.chorus.kaggle_configured?,
      :gnip_configured => Chorus::Application.config.chorus.gnip_configured?
    } }
  end

  def version
    render :inline => build_string
  end

  def build_string
    f = File.join(Rails.root, 'version_build')
    File.exists?(f) ? File.read(f) : Chorus::VERSION::STRING
  end
end
