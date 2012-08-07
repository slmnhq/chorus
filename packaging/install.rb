#!./chorus_installation/bin/ruby

require 'fileutils'
require 'securerandom'
require 'yaml'

class Install
  InstallationFailed = Class.new(StandardError)
  NonRootValidationError = Class.new(StandardError)

  attr_accessor :destination_path, :database_password, :database_user

  def initialize(installer_home)
    @installer_home = installer_home
  end

  def prompt(message, default="")
    puts message
  end

  def validate_non_root
    raise NonRootValidationError if Process.uid == 0
  end

  def chorus_installation_path
    File.join(@installer_home, 'chorus_installation')
  end
  
  def determine_postgres_installer
    @postgres_package = get_postgres_build
  end

  def get_destination_path
    prompt "Please enter Chorus destination path [/opt/chorus]:"
    @destination_path = File.expand_path(get_input || "/opt/chorus")
  end

  def get_postgres_build
    input = nil
    input = 3 if is_supported_suse?

    redhat_version = supported_redhat_version
    input = 1 if redhat_version == '5.5'
    input = 2 if redhat_version == '6.2'

    while !(1..4).include?(input)
      prompt "Could not detect your Linux version. Please select one of the following:"
      prompt "[1] - RedHat (CentOS/RHEL) 5.5 or compatible"
      prompt "[2] - RedHat (CentOS/RHEL) 6.2 or compatible"
      prompt "[3] - SuSE Enterprise Linux Server 11 or compatible"
      prompt "[4] - Abort install"
      input = get_input.to_i
    end

    case input
      when 1
        "postgres-redhat5.5-9.1.4.tar.gz"
      when 2
        "postgres-redhat6.2-9.1.4.tar.gz"
      when 3
        "postgres-suse11-9.1.4.tar.gz"
      else
        raise InstallationFailed, "Version not supported"
    end
  end

  def supported_redhat_version
    return nil unless File.exists?('/etc/redhat-release')

    version_string = File.open('/etc/redhat-release').read
    version_string =~ /release (\d\.\d)/
    found_version = $1
    found_version if %w(5.5 6.2).include?(found_version)
  end

  def is_supported_suse?
    return false unless File.exists?('/etc/SuSE-release')

    File.open('/etc/SuSE-release').readlines.any? do |release|
      release.match(/^VERSION = 11$/)
    end
  end

  def copy_chorus_to_destination
    FileUtils.mkdir_p(release_path)
    FileUtils.cp_r File.join(chorus_installation_path, '.'), release_path, :preserve => true
  end

  def create_shared_structure
    FileUtils.mkdir_p("#{destination_path}/shared/tmp/pids")
    FileUtils.mkdir_p("#{destination_path}/shared/solr/data")
    FileUtils.mkdir_p("#{destination_path}/shared/log")
    FileUtils.mkdir_p("#{destination_path}/shared/system")
  end

  def copy_config_files
    FileUtils.mkdir_p("#{destination_path}/shared")
    FileUtils.cp("#{chorus_installation_path}/packaging/database.yml.example", "#{destination_path}/shared/database.yml")
    FileUtils.cp("#{chorus_installation_path}/config/chorus.yml.example", "#{destination_path}/shared/chorus.yml")
  end

  def link_services
    FileUtils.ln_sf("#{release_path}/postgres", "#{destination_path}/postgres")
    FileUtils.ln_sf("#{release_path}/nginx_dist", "#{destination_path}/nginx_dist")
    FileUtils.ln_sf("#{release_path}/packaging/server_control.sh", "#{destination_path}/server_control.sh")
  end

  def link_shared_files
    FileUtils.ln_sf("#{destination_path}/shared/chorus.yml", "#{release_path}/config/chorus.yml")
    FileUtils.ln_sf("#{destination_path}/shared/database.yml", "#{release_path}/config/database.yml")

    FileUtils.ln_sf("#{destination_path}/shared/tmp", "#{release_path}/tmp")
    FileUtils.ln_sf("#{destination_path}/shared/solr", "#{release_path}/solr")
    FileUtils.ln_sf("#{destination_path}/shared/log", "#{release_path}/log")
    FileUtils.ln_sf("#{destination_path}/shared/system", "#{release_path}/system")
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
    system "cd #{destination_path} && ./server_control.sh start postgres > /dev/null"
    sleep 2
    system %Q{#{destination_path}/postgres/bin/psql -d postgres -p8543 -c "CREATE ROLE #{database_user} PASSWORD '#{database_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN" > /dev/null}
    system "cd #{release_path} && RAILS_ENV=production bin/rake db:create db:migrate > /dev/null"
    system "cd #{destination_path} && ./server_control.sh stop postgres > /dev/null"
  end

  def link_current_to_release
    FileUtils.ln_sf("#{release_path}", "#{destination_path}/current")
  end

  def extract_nginx
    system("tar xzf #{release_path}/packaging/nginx_dist-1.2.2.tar.gz -C #{release_path}/")
  end

  def extract_postgres

    system("tar xzf #{release_path}/packaging/postgres/#{@postgres_package} -C #{release_path}/")
  end

  private
  def get_input
    input = gets.strip
    input.empty? ? nil : input
  end

  def version
    File.read("#{chorus_installation_path}/version_build").strip
  end

  def release_path
    "#{destination_path}/releases/#{version}"
  end
end

if __FILE__ == $0
  begin
    install = Install.new(File.dirname(__FILE__))

    install.validate_non_root
    install.get_destination_path
    install.determine_postgres_installer

    print "Copying files into #{install.destination_path}..."
    install.copy_chorus_to_destination
    install.create_shared_structure
    install.copy_config_files
    install.create_database_config
    install.link_shared_files
    puts "Done"

    print "Extracting NGINX..."
    install.extract_nginx
    puts "Done"

    print "Extracting postgres..."
    install.extract_postgres
    puts "Done"

    install.link_services

    print "Creating database..."
    install.create_database
    install.create_database_structure
    puts "Done"

    install.link_current_to_release

    puts "Installation completed."
    puts "run ./server_control.sh start from #{install.destination_path} to start everything up!"
  rescue Install::NonRootValidationError
    puts "Aborting install: Please run the installer as a non-root user."
  end
end

