#!./chorus_installation/bin/ruby

require 'fileutils'
require 'securerandom'
require 'yaml'
require_relative 'version_detector'

class Install
  InstallationFailed = Class.new(StandardError)
  NonRootValidationError = Class.new(StandardError)
  CommandFailed = Class.new(StandardError)
  LocalhostUndefined = Class.new(StandardError)
  InvalidVersion = Class.new(StandardError)
  UpgradeCancelled = Class.new(StandardError)
  InvalidOperatingSystem = Class.new(StandardError)
  AlreadyInstalled = Class.new(StandardError)
  UpgradeTo21Required = Class.new(StandardError)
  UpgradeUnsupported = Class.new(StandardError)

  attr_accessor :destination_path, :database_password, :database_user, :do_upgrade, :do_legacy_upgrade

  DEFAULT_PATH = "/opt/chorus"

  MESSAGES = {
      already_installed: "This version is already installed",
      select_os: "Could not detect your Linux version. Please select one of the following:",
      select_redhat_55: "[1] - RedHat (CentOS/RHEL) 5.5 or compatible",
      select_redhat_62: "[2] - RedHat (CentOS/RHEL) 6.2 or compatible",
      select_SLES_11: "[3] - SuSE Enterprise Linux Server 11 or compatible",
      select_abort_install: "[4] - Abort install",
      default_chorus_path: "Please enter Chorus destination path",
      installation_complete: "Installation completed.",
      installation_failed: "Installation failed. Please check install.log for details",
      installation_failed_with_reason: "Installation failed: %s",
      abort_install_version_not_supported: "Aborting install: Version not supported",
      abort_install_non_root: "Aborting install: Please run the installer as a non-root user.",
      abort_install_localhost_undefined: "Aborting install: Could not connect to 'localhost', please set in /etc/hosts",
      abort_install_cancelled_upgrade: "Aborting install: Cancelled by user",
      upgrade_to_2_1_required: "Aborting install: Chorus must be upgraded to 2.1 before it can be upgraded to 2.2",
      upgrade_unsupported: "Aborting install: Chorus cannot upgrade from existing installation",
      run_server_control: "run ./server_control.sh start from %s to start everything up!",
      confirm_upgrade: "Existing version of Chorus detected. Upgrading will restart services.  Continue now? [y]:",
      confirm_legacy_upgrade: "Chorus 2.1 installation detected, do you want to upgrade to 2.2? [y]:",
      legacy_destination_path: "Chorus 2.2 cannot be installed in the same directory as 2.1, please provide an empty directory"
  }

  def initialize(installer_home, silent=false)
    @installer_home = installer_home
    @silent = !!silent
  end

  def prompt(message)
    puts message
  end

  def log(message)
    puts message
    File.open("#{destination_path}/install.log", "a") { |f| f.puts message }
  end

  def validate_non_root
    raise NonRootValidationError if Process.uid == 0
  end

  def validate_localhost
    raise LocalhostUndefined unless system("ping -c 1 localhost > /dev/null")
  end

  def chorus_installation_path
    File.join(@installer_home, 'chorus_installation')
  end

  def determine_postgres_installer
    @postgres_package = get_postgres_build
  end

  def silent?
    @silent
  end

  def prompt_or_default(default)
    if silent?
      default
    else
      yield || default
    end
  end

  def get_destination_path
    default_path = ENV['CHORUS_HOME'] || DEFAULT_PATH
    default_path = default_path.sub(/\/current$/, '')

    relative_path = prompt_or_default(default_path) do
      prompt "#{MESSAGES[:default_chorus_path]} [#{default_path}]:"
      get_input
    end

    @destination_path = File.expand_path(relative_path)
    detector = VersionDetector.new(@destination_path)
    prompt_for_2_2_upgrade if detector.can_upgrade_2_2?(version)
    prompt_for_legacy_upgrade if detector.can_upgrade_legacy?
  end

  def prompt_for_legacy_upgrade
    user_upgrade_input = prompt_or_default('y') do
      prompt MESSAGES[:confirm_legacy_upgrade]
      get_input
    end

    unless %w(y yes).include? user_upgrade_input.downcase
      raise(UpgradeCancelled)
    end

    self.do_legacy_upgrade = true
    prompt_legacy_upgrade_destination
  end

  def prompt_legacy_upgrade_destination
    @destination_path = nil
    while @destination_path.nil? do
      prompt MESSAGES[:legacy_destination_path]
      @destination_path = get_input
    end

    @destination_path = File.expand_path @destination_path
  end

  def prompt_for_2_2_upgrade
    user_upgrade_input = prompt_or_default('y') do
      prompt MESSAGES[:confirm_upgrade]
      get_input
    end

    unless %w(y yes).include? user_upgrade_input.downcase
      raise(UpgradeCancelled)
    end

    self.do_upgrade = true
  end

  def get_postgres_build
    input = nil
    input = 3 if is_supported_suse?

    redhat_version = supported_redhat_version
    input = 1 if redhat_version == '5.5'
    input = 2 if redhat_version == '6.2'

    if silent? && input.nil?
      raise InvalidOperatingSystem
    end

    while !(1..4).include?(input)
      prompt MESSAGES[:select_os]
      prompt MESSAGES[:select_redhat_55]
      prompt MESSAGES[:select_redhat_62]
      prompt MESSAGES[:select_SLES_11]
      prompt MESSAGES[:select_abort_install]
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
        raise InvalidOperatingSystem
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
    unless File.exists? "#{destination_path}/shared/database.yml"
      FileUtils.cp("#{chorus_installation_path}/packaging/database.yml.example", "#{destination_path}/shared/database.yml")
    end
    FileUtils.cp("#{chorus_installation_path}/config/chorus.yml.example", "#{destination_path}/shared/chorus.yml.example")
    unless File.exists? "#{destination_path}/shared/chorus.yml"
      FileUtils.cp("#{chorus_installation_path}/config/chorus.defaults.yml", "#{destination_path}/shared/chorus.yml")
    end
  end

  def link_services
    FileUtils.ln_sf("#{release_path}/packaging/server_control.sh", "#{destination_path}/server_control.sh")
  end

  def link_shared_files
    FileUtils.ln_sf("#{destination_path}/shared/chorus.yml", "#{release_path}/config/chorus.yml")
    FileUtils.ln_sf("#{destination_path}/shared/database.yml", "#{release_path}/config/database.yml")

    FileUtils.ln_sf("#{destination_path}/shared/db", "#{release_path}/postgres-db")
    FileUtils.ln_sf("#{destination_path}/shared/tmp", "#{release_path}/tmp")
    FileUtils.ln_sf("#{destination_path}/shared/solr", "#{release_path}/solr")
    FileUtils.ln_sf("#{destination_path}/shared/log", "#{release_path}/log")
    FileUtils.ln_sf("#{destination_path}/shared/system", "#{release_path}/system")
  end

  def create_database_config
    return if do_upgrade

    database_config_path = "#{destination_path}/shared/database.yml"
    database_config = YAML.load_file(database_config_path)

    self.database_password = SecureRandom.hex
    self.database_user = database_config['production']['username']

    database_config['production']['password'] = database_password

    File.open(database_config_path, 'w') do |file|
      YAML.dump(database_config, file)
    end
  end

  def setup_database
    if do_upgrade
      start_postgres
      chorus_exec "cd #{release_path} && RAILS_ENV=production bin/rake db:migrate"
      stop_postgres
    else
      chorus_exec "#{release_path}/postgres/bin/initdb --locale=en_US.UTF-8 #{destination_path}/shared/db"
      start_postgres
      chorus_exec %Q{#{release_path}/postgres/bin/psql -d postgres -p8543 -h 127.0.0.1 -c "CREATE ROLE #{database_user} PASSWORD '#{database_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN"}
      chorus_exec "cd #{release_path} && RAILS_ENV=production bin/rake db:create db:migrate db:seed"
      stop_postgres
    end
  end

  def link_current_to_release
    File.delete("#{destination_path}/current") if File.exists?("#{destination_path}/current")
    FileUtils.ln_sf("#{release_path}", "#{destination_path}/current")
  end

  def extract_postgres
    chorus_exec("tar xzf #{release_path}/packaging/postgres/#{@postgres_package} -C #{release_path}/")
  end

  def stop_old_install
    return unless do_upgrade

    chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/server_control.sh stop"
  end

  def startup
    return unless do_upgrade

    server_control "start"
  end

  def install
    log "Installing Chorus version #{version} to #{destination_path}"
    log "Copying files into #{destination_path}..."
    copy_chorus_to_destination
    create_shared_structure
    copy_config_files
    create_database_config
    link_shared_files
    log "Done"

    log "Extracting postgres..."
    extract_postgres
    log "Done"

    if do_upgrade
      log "Shutting down previous Chorus install..."
      stop_old_install
      log "Done"
      log "Updating database..."
    else
      log "Creating database..."
    end

    link_services
    setup_database
    log "Done"
  rescue InvalidVersion => e
    raise InstallationFailed.new MESSAGES[:installation_failed_with_reason] % e.message
  rescue CommandFailed => e
    log "#{e.class}: #{e.message}"
    raise InstallationFailed.new MESSAGES[:installation_failed]
  rescue => e
    log "#{e.class}: #{e.message}"
    raise InstallationFailed.new MESSAGES[:installation_failed_with_reason] % e.message
  end

  def remove_and_restart_previous!
    FileUtils.rm_rf release_path
    chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/server_control.sh start" if do_upgrade
  end

  private
  def get_input
    input = gets.strip
    input.empty? ? nil : input
  end

  def version
    @version ||= File.read("#{chorus_installation_path}/version_build").strip
  end

  def release_path
    "#{destination_path}/releases/#{version}"
  end

  def chorus_exec(command)
    system("PATH=#{release_path}/postgres/bin:$PATH && #{command} >> #{destination_path}/install.log 2>&1") || raise(CommandFailed, command)
  end

  def stop_postgres
    server_control "stop postgres"
  end

  def start_postgres
    server_control "start postgres"
  end

  def server_control(args)
    chorus_exec "CHORUS_HOME=#{release_path} #{release_path}/packaging/server_control.sh #{args}"
  end
end

if __FILE__ == $0
  begin
    installer = Install.new(File.dirname(__FILE__), ARGV.include?('-a'))

    installer.validate_non_root
    installer.validate_localhost
    installer.get_destination_path
    installer.determine_postgres_installer

    installer.install

    installer.link_current_to_release

    print "Starting up Chorus..."
    installer.startup
    puts "Done"

    puts Install::MESSAGES[:installation_complete]
    puts Install::MESSAGES[:run_server_control] % installer.destination_path unless installer.do_upgrade
  rescue Install::NonRootValidationError
    puts Install::MESSAGES[:abort_install_non_root]
    exit 1
  rescue Install::LocalhostUndefined
    puts Install::MESSAGES[:abort_install_localhost_undefined]
    exit 1
  rescue Install::InvalidOperatingSystem
    puts Install::MESSAGES[:abort_install_version_not_supported]
    exit 1
  rescue Install::UpgradeCancelled
    puts Install::MESSAGES[:abort_install_cancelled_upgrade]
    exit 1
  rescue Install::InstallationFailed => e
    installer.remove_and_restart_previous!
    puts e.message
    exit 1
  rescue Install::UpgradeTo21Required
    puts Install::MESSAGES[:upgrade_to_2_1_required]
    exit 1
  rescue Install::UpgradeUnsupported
    puts Install::MESSAGES[:upgrade_unsupported]
    exit 1
  rescue Install::AlreadyInstalled
    puts Install::MESSAGES[:already_installed]
    exit 0
  rescue => e
    File.open("install.log", "a") { |f| f.puts "#{e.class}: #{e.message}" }
    puts Install::MESSAGES[:installation_failed_with_reason] % e.message
    exit 1
  end
end
