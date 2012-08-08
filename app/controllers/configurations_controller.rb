require_relative '../../version'
require 'ldap_client'

class ConfigurationsController < ApplicationController
  skip_before_filter :require_login, :only => :version

  def show
    render :json => { :response => {
      :external_auth_enabled => LdapClient.enabled?,
      :gpfdist_write_permissions => gpfdist_write_permissions,
      :gpfdist_url => Chorus::Application.config.chorus['gpfdist']['url'],
      :gpfdist_port => Chorus::Application.config.chorus['gpfdist']['port'],
      :gpfdist_data_dir => Chorus::Application.config.chorus['gpfdist']['data_dir'],
      :file_sizes_mb_workfiles => Chorus::Application.config.chorus['file_sizes_mb']['workfiles'],
      :file_sizes_mb_csv_imports => Chorus::Application.config.chorus['file_sizes_mb']['csv_imports'],
      :timezoneOffset => Chorus::Application.config.chorus['timezone_offset']
    } }
  end

  def version
    render :inline => build_string
  end

  def build_string
    f = File.join(Rails.root, 'version_build')
    File.exists?(f) ? File.read(f) : Chorus::VERSION::STRING
  end

  private

  def gpfdist_write_permissions
    path = Chorus::Application.config.chorus['gpfdist']['data_dir']
    File.directory?(path) && File.writable?(path)
  end
end
