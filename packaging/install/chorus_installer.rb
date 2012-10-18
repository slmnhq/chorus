require 'fileutils'
require 'securerandom'
require 'yaml'
require_relative 'installer_errors'
require 'base64'
require 'openssl'
require 'pathname'

class ChorusInstaller
  attr_accessor :destination_path, :data_path, :database_password, :database_user, :install_mode, :legacy_installation_path, :log_stack

  INSTALL_MODES = [:upgrade_existing, :upgrade_legacy, :fresh]

  INSTALL_MODES.each do |mode|
    define_method :"#{mode}?" do
      install_mode == mode
    end
  end

  DEFAULT_PATH = "/usr/local/greenplum-chorus"
  DEFAULT_DATA_PATH = "/data/greenplum-chorus"

  def initialize(options={})
    @installer_home = options[:installer_home]
    @version_detector = options[:version_detector]
    @logger = options[:logger]
    @io = options[:io]
    @log_stack = []
    @install_mode = :fresh
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

  def get_data_path
    if !@version_detector.can_upgrade_2_2?(version)
      relative_path = @io.prompt_or_default(:data_path, DEFAULT_DATA_PATH)
      self.data_path = File.expand_path(relative_path)
      log "Data path = #{@data_path}"
    end

  end

  def prompt_for_passphrase
    @io.prompt_or_default(:passphrase, "")
  end

  def prompt_for_legacy_upgrade
    @io.require_confirmation :confirm_legacy_upgrade

    self.install_mode = :upgrade_legacy
    self.legacy_installation_path = destination_path
    prompt_legacy_upgrade_destination
  end

  def prompt_legacy_upgrade_destination
    @destination_path = @io.prompt_until(:legacy_destination_path) { |input| !input.nil? }
    @destination_path = File.expand_path @destination_path
  end

  def prompt_for_2_2_upgrade
    @io.require_confirmation :confirm_upgrade
    self.install_mode = :upgrade_existing
  end

  def get_postgres_build
    input = nil
    input = 3 if is_supported_suse?
    input = 5 if is_supported_mac?

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
        "postgres-redhat5.5-9.2.1.tar.gz"
      when 2
        "postgres-redhat6.2-9.2.1.tar.gz"
      when 3
        "postgres-suse11-9.2.1.tar.gz"
      when 5
        "postgres-osx-9.2.1.tar.gz"
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

  def is_supported_mac?
    `uname`.strip == "Darwin"
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

  def generate_paths_file
    File.open("#{destination_path}/chorus_path.sh", 'w') do |file|
      file.puts "export CHORUS_HOME=#{destination_path}"
      file.puts "export PATH=$PATH:$CHORUS_HOME"
    end
  end

  def link_services
    FileUtils.ln_sf("#{release_path}/packaging/chorus_control.sh", "#{destination_path}/chorus_control.sh")
  end

  def link_shared_files
    FileUtils.ln_sf("#{destination_path}/shared/chorus.yml", "#{release_path}/config/chorus.yml")
    FileUtils.ln_sf("#{destination_path}/shared/database.yml", "#{release_path}/config/database.yml")
    FileUtils.ln_sf("#{destination_path}/shared/secret.key", "#{release_path}/config/secret.key")

    #Symlink the data paths under shared to the actual data_path directory.  So the app actually
    #goes through two symlinks
    if data_path && File.expand_path("#{data_path}") != File.expand_path("#{destination_path}/shared")
      ['db', 'system', 'solr/data', 'log'].each do |path|
        destination = Pathname.new("#{destination_path}/shared/#{path}")
        source = Pathname.new("#{data_path}/#{path}")
        if(destination.exist? && !destination.symlink?)
          destination.rmdir
        end
        unless(source.exist?)
          source.mkpath
        end
        FileUtils.ln_sf(source.to_s, destination.to_s)
      end
    end

    FileUtils.ln_sf("#{destination_path}/shared/db", "#{release_path}/postgres-db")
    FileUtils.ln_sf("#{destination_path}/shared/tmp", "#{release_path}/tmp")
    FileUtils.ln_sf("#{destination_path}/shared/solr/data", "#{release_path}/solr/data")
    FileUtils.ln_sf("#{destination_path}/shared/log", "#{release_path}/log")
    FileUtils.ln_sf("#{destination_path}/shared/system", "#{release_path}/system")
  end

  def create_database_config
    return if upgrade_existing?

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
    if upgrade_existing?
      start_postgres
      log "Running database migrations..." do
        chorus_exec "cd #{release_path} && RAILS_ENV=production bin/rake db:migrate"
        stop_postgres
      end
    else
      log "Initializing database..." do
        chorus_exec "#{release_path}/postgres/bin/initdb --locale=en_US.UTF-8 -D #{data_path}/db"
        start_postgres
        chorus_exec %Q{#{release_path}/postgres/bin/psql -U `whoami` -d postgres -p8543 -h 127.0.0.1 -c "CREATE ROLE #{database_user} PASSWORD '#{database_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN"}
        db_commands = "db:create db:migrate"
        db_commands += " db:seed" unless upgrade_legacy?
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
    return unless upgrade_existing?
    log "Stopping Chorus..." do
      chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/chorus_control.sh stop"
    end
  end

  def startup
    return unless upgrade_existing?

    log "Starting up Chorus..." do
      chorus_control "start"
    end
  end

  def dump_and_shutdown_legacy
    set_env = "EDCHOME=#{legacy_installation_path}"
    log "Shutting down Chorus..." do
      chorus_exec("cd #{legacy_installation_path}/bin && #{set_env} ./edcsvrctl stop; true")
    end
    log "Starting legacy Chorus services (i.e. postgres)..." do
    # run twice because sometimes this fails the first time
      chorus_exec("cd #{legacy_installation_path}/bin && (#{set_env} ./edcsvrctl start || #{set_env} ./edcsvrctl start)")
    end
    log "Dumping previous Chorus data..." do
      chorus_exec("cd #{release_path} && PGUSER=edcadmin pg_dump -p 8543 chorus -O -f legacy_database.sql")
    end
    log "Stopping legacy Chorus services (i.e. postgres)..." do
      chorus_exec("cd #{legacy_installation_path}/bin && #{set_env} ./edcsvrctl stop")
    end
  end

  def migrate_legacy_data
    log "Migrating data from previous version..." do
      log "Loading legacy data into postgres..." do
        chorus_exec("cd #{release_path} && CHORUS_HOME=#{release_path} packaging/chorus_migrate -s legacy_database.sql -w #{legacy_installation_path}/chorus-apps/runtime/data")
      end
    end
  end

  def install
    validate_localhost
    get_destination_path
    get_data_path
    determine_postgres_installer

    log "Installing Chorus version #{version} to #{destination_path}"
    log "Copying files into #{destination_path}..." do
      copy_chorus_to_destination
      create_shared_structure
      copy_config_files
      create_database_config
      link_shared_files
    end

    log "Configuring secret key..."
    configure_secret_key

    log "Extracting postgres..." do
      extract_postgres
    end

    if upgrade_existing?
      log "Shutting down previous Chorus install..." do
        stop_old_install
      end
    elsif upgrade_legacy?
      dump_and_shutdown_legacy
    end

    log "#{upgrade_existing? ? "Updating" : "Creating"} database..." do
      link_services
      generate_paths_file
      setup_database
    end

    configure_file_storage_directory

    if upgrade_legacy?
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
    chorus_control "stop" if upgrade_legacy? rescue # rescue in case chorus_control blows up
    log "#{e.class}: #{e.message}"
    raise InstallerErrors::InstallationFailed, e.message
  end

  def remove_and_restart_previous!
    if upgrade_existing?
      log "Restarting server..."
      chorus_exec "CHORUS_HOME=#{destination_path}/current #{destination_path}/packaging/chorus_control.sh start"
    else
      stop_postgres
    end
    log "For Postgres errors check #{destination_path}/shared/db/server.log"
    FileUtils.rm_rf release_path
  end

  def configure_secret_key
    key_file = "#{destination_path}/shared/secret.key"
    unless File.exists?(key_file)
      passphrase = prompt_for_passphrase
      if passphrase.nil? || passphrase.strip.empty?
        passphrase = Random.new.bytes(32)
      end
      # only a subset of openssl is available built-in to jruby, so this is the best we could do without including the full jruby-openssl gem
      secret_key = Base64.strict_encode64(OpenSSL::Digest.new("SHA-256", passphrase).digest)
      File.open(key_file, 'w') do |f|
        f.puts secret_key
      end
    end
  end

  def configure_file_storage_directory
    return if upgrade_existing?
    chorus_config_file = "#{@destination_path}/shared/chorus.yml"
    config = YAML.load_file(chorus_config_file)

    default_path = "#{@destination_path}/shared"
    if File.expand_path(data_path) != File.expand_path(default_path)
      config['assets_storage_path'] = "#{data_path}/system/"
    end

    File.open(chorus_config_file, 'w') do |file|
      YAML.dump(config, file)
    end
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
    chorus_control "stop postgres"
  end

  def start_postgres
    log "Starting postgres..."
    chorus_control "start postgres"
  end

  def chorus_control(args)
    chorus_exec "CHORUS_HOME=#{release_path} #{release_path}/packaging/chorus_control.sh #{args}"
  end
end
