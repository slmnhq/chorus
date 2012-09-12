require 'fileutils'
require 'securerandom'
require 'yaml'
require_relative 'installer_errors'

class ChorusInstaller
  attr_accessor :destination_path, :database_password, :database_user, :do_upgrade, :do_legacy_upgrade, :legacy_installation_path, :log_stack

  DEFAULT_PATH = "/opt/chorus"

  def initialize(options={})
    @installer_home = options[:installer_home]
    @version_detector = options[:version_detector]
    @logger = options[:logger]
    @io = options[:io]
    @log_stack = []
  end

  def prompt(message)
    print "\n#{message} "
  end

  def log(message, &block)
    message = "  " * log_stack.count + message
    @io.log message
    @logger.log message
    if block_given?
      log_stack.push(nil).tap { yield block }.pop
      log "...done."
    end
  end

  def validate_non_root
    if Process.uid == 0
      raise InstallerErrors::InstallAborted, "Please run the installer as a non-root user."
    end
  end

  def validate_localhost
    unless system("ping -c 1 localhost > /dev/null")
      raise InstallerErrors::InstallAborted, "Could not connect to 'localhost', please set in /etc/hosts"
    end
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

    relative_path = @io.prompt_or_default(:destination_path, default_path)

    @destination_path = File.expand_path(relative_path)
    @version_detector.destination_path = @destination_path
    prompt_for_2_2_upgrade if @version_detector.can_upgrade_2_2?(version)
    prompt_for_legacy_upgrade if @version_detector.can_upgrade_legacy?
    @logger.logfile = File.join(@destination_path, 'install.log')
  end

  def prompt_for_legacy_upgrade
    @io.require_confirmation :confirm_legacy_upgrade

    self.do_legacy_upgrade = true
    self.legacy_installation_path = destination_path
    prompt_legacy_upgrade_destination
  end

  def prompt_legacy_upgrade_destination
    @destination_path = @io.prompt_until(:legacy_destination_path) { |input| !input.nil? }
    @destination_path = File.expand_path @destination_path
  end

  def prompt_for_2_2_upgrade
    @io.require_confirmation :confirm_upgrade
    self.do_upgrade = true
  end

  def get_postgres_build
    input = nil
    input = 3 if is_supported_suse?

    redhat_version = supported_redhat_version
    input = 1 if redhat_version == '5.5'
    input = 2 if redhat_version == '6.2'

    if @io.silent? && input.nil?
      raise InstallerErrors::InstallAborted, "Version not supported."
    end

    if input.nil?
      input = @io.prompt_until(:select_os) { |input| (1..4).include?(input.to_i) }.to_i
    end

    case input
      when 1
        "postgres-redhat5.5-9.1.4.tar.gz"
      when 2
        "postgres-redhat6.2-9.1.4.tar.gz"
      when 3
        "postgres-suse11-9.1.4.tar.gz"
      else
        raise InstallerErrors::InstallAborted, "Version not supported."
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
      log "Running database migrations..." do
        chorus_exec "cd #{release_path} && RAILS_ENV=production bin/rake db:migrate"
        stop_postgres
      end
    else
      log "Initializing database..." do
        chorus_exec "#{release_path}/postgres/bin/initdb --locale=en_US.UTF-8 #{destination_path}/shared/db"
        start_postgres
        chorus_exec %Q{#{release_path}/postgres/bin/psql -d postgres -p8543 -h 127.0.0.1 -c "CREATE ROLE #{database_user} PASSWORD '#{database_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN"}
        db_commands = "db:create db:migrate"
        db_commands += " db:seed" unless do_legacy_upgrade
        log "Running rake #{db_commands}"
        chorus_exec "cd #{release_path} && RAILS_ENV=production bin/rake #{db_commands}"
        stop_postgres
      end
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
    log "Stopping Chorus..." do
      chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/server_control.sh stop"
    end
  end

  def startup
    return unless do_upgrade

    log "Starting up Chorus..." do
      server_control "start"
    end
  end

  def dump_and_shutdown_legacy
    set_env = "JAVA_HOME=/usr/lib/jvm/jre-1.6.0-openjdk.x86_64 EDCHOME=#{legacy_installation_path}"
    log "Shutting down Chorus..." do
      chorus_exec("cd #{legacy_installation_path}/bin && #{set_env} ./edcsvrctl stop; true")
    end
    log "Starting legacy Chorus services (i.e. postgres)..." do
    # run twice because sometimes this fails the first time
      chorus_exec("cd #{legacy_installation_path}/bin && (#{set_env} ./edcsvrctl start || #{set_env} ./edcsvrctl start)")
    end
    log "Dumping previous Chorus data..." do
      legacy_pg_data = "#{legacy_installation_path}/runtime/postgresql-data"
      chorus_exec("cd #{release_path} && PGUSER=edcadmin pg_dump -p 8543 chorus -O -f legacy_database.sql")
    end
    log "Stopping legacy Chorus services (i.e. postgres)..." do
      chorus_exec("cd #{legacy_installation_path}/bin && #{set_env} ./edcsvrctl stop")
    end
  end

  def migrate_legacy_data
    log "Migrating data from previous version..." do
      start_postgres
      log "Loading legacy data into postgres..." do
        chorus_exec("cd #{release_path} && packaging/legacy_migrate_schema_setup.sh legacy_database.sql")
      end
      log "Running legacy migrations..." do
        chorus_exec("cd #{release_path} && RAILS_ENV=production WORKFILE_PATH=#{legacy_installation_path}/chorus-apps/runtime/data bin/rake legacy:migrate")
      end
    end
  end

  def install
    validate_non_root
    validate_localhost
    get_destination_path
    determine_postgres_installer

    log "Installing Chorus version #{version} to #{destination_path}"
    log "Copying files into #{destination_path}..." do
      copy_chorus_to_destination
      create_shared_structure
      copy_config_files
      create_database_config
      link_shared_files
    end

    log "Extracting postgres..." do
      extract_postgres
    end

    if do_upgrade
      log "Shutting down previous Chorus install..." do
        stop_old_install
      end
    elsif do_legacy_upgrade
      dump_and_shutdown_legacy
    end

    log "#{do_upgrade ? "Updating" : "Creating"} database..." do
      link_services
      setup_database
    end

    if do_legacy_upgrade
      #log "Migrating settings from previous version..."
      #migrate_legacy_settings
      #log "Done"

      migrate_legacy_data
    end

    link_current_to_release
  rescue InstallerErrors::InstallAborted => e
    puts e.message
    exit 1
  rescue InstallerErrors::AlreadyInstalled => e
    puts e.message
    exit 0
  rescue InstallerErrors::InstallationFailed => e
    log "#{e.class}: #{e.message}"
    raise
  rescue => e
    server_control "stop" if do_legacy_upgrade rescue # rescue in case server_control blows up
    log "#{e.class}: #{e.message}"
    raise InstallerErrors::InstallationFailed, e.message
  end

  def remove_and_restart_previous!
    log "Restarting server..."
    FileUtils.rm_rf release_path
    chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/packaging/server_control.sh start" if do_upgrade
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
    @logger.capture_output("PATH=#{release_path}/postgres/bin:$PATH && #{command}") || raise(InstallerErrors::CommandFailed, command)
  end

  def stop_postgres
    log "Stopping postgres..."
    server_control "stop postgres"
  end

  def start_postgres
    log "Starting postgres..."
    server_control "start postgres"
  end

  def server_control(args)
    chorus_exec "CHORUS_HOME=#{release_path} #{release_path}/packaging/server_control.sh #{args}"
  end
end
