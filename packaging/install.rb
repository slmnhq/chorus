#!/usr/bin/env ruby

require 'fileutils'
require 'securerandom'

class Install
  attr_accessor :destination_path, :database_password, :database_user

  def get_destination_path
    puts "Please enter Chorus destination path [/opt/chorus]:"
    @destination_path = get_input || "/opt/chorus"
  end

  def copy_chorus_to_destination
    FileUtils.mkdir_p(release_path)
    FileUtils.cp_r './chorus_installation/.', release_path
  end

  def create_shared_structure
    FileUtils.mkdir_p("#{destination_path}/shared/tmp/pids")
    FileUtils.mkdir_p("#{destination_path}/shared/solr/data")
    FileUtils.mkdir_p("#{destination_path}/shared/log")
    FileUtils.mkdir_p("#{destination_path}/shared/system")
  end

  def copy_config_files
    FileUtils.mkdir_p("#{destination_path}/shared")
    FileUtils.cp('./chorus_installation/config/database.yml.example', "#{destination_path}/shared/database.yml")
    FileUtils.cp('./chorus_installation/config/chorus.yml.example', "#{destination_path}/shared/chorus.yml")
  end

  def link_services
    FileUtils.ln_sf("#{release_path}/postgres", "#{destination_path}/postgres")
    FileUtils.ln_sf("#{release_path}/nginx_dist", "#{destination_path}/nginx_dist")
    FileUtils.ln_sf("#{release_path}/packaging/server_control.sh", "#{destination_path}/server_control.sh")
  end

  def create_database
    system "#{destination_path}/postgres/bin/initdb --locale=en_US.UTF-8 #{destination_path}/shared/db"
  end

  def create_database_config
    database_config_path = "#{destination_path}/shared/database.yml"
    database_config = YAML.load_file(database_config_path)

    self.database_password = SecureRandom.hex
    self.database_user = database_config['production']['username']

    database_config['production']['password'] = database_password

    File.open(database_config_path, 'w') do |file|
      YAML.dump(database_config, file)
    end
  end

  def create_database_structure
    system "#{destination_path}/server_control.sh start postgres"
    sleep 2
    system %Q{#{destination_path}/postgres/bin/psql -d postgres -p8543 -c "CREATE ROLE '#{database_user}' PASSWORD '#{database_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN}
    system "cd #{release_path} && RAILS_ENV=production bin/rake db:create db:migrate"
    system "#{destination_path}/server_control.sh stop postgres"
  end

  def link_current_to_release
    FileUtils.ln_sf("#{release_path}", "#{destination_path}/current")
  end

  private
  def get_input
    input = gets.strip
    input.empty? ? nil : input
  end

  def version
    File.read('./chorus_installation/VERSION').strip
  end

  def release_path
    "#{destination_path}/releases/#{version}"
  end
end




if __FILE__ == $0
  install = Install.new

  install.get_destination_path
  install.copy_chorus_to_destination
  install.create_shared_structure
  install.copy_config_files
  install.create_database_config
  install.link_services
  install.create_database_structure
  install.link_current_to_release
end

