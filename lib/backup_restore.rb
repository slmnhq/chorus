require 'safe_mktmpdir'
require 'pathname'
require 'open3'

module BackupRestore
  BACKUP_FILE_PREFIX = "greenplum_chorus_backup_"
  DATABASE_DATA_FILENAME = "database.gz"
  ASSETS_FILENAME = "assets.tgz"
  ASSET_PATHS = %w{assets_storage_path}
  MODELS_WITH_ASSETS = %w{csv_files attachments note_attachments users workfile_versions workspaces}

  def self.backup(backup_dir, rolling_days = nil)
    Backup.new(backup_dir, rolling_days).backup
  end

  def self.restore(backup_filename, do_not_warn=false)
    Restore.new(backup_filename, do_not_warn).restore
  end

  module SharedMethods
    def log(*args)
      puts *args
    end

    def db_config
      Rails.application.config.database_configuration[Rails.env]
    end

    def database_name
      db_config['database']
    end

    def database_port
      db_config['port']
    end

    def config_path(name)
      raise "Could not find path for ''#{name}' in chorus.yml" unless chorus_config[name]
      chorus_config[name].gsub ":rails_root", Rails.root.to_s
    end

    def chorus_config
      @chorus_config ||= ChorusConfig.new
    end

    def chorus_config=(value)
      @chorus_config = value
    end

    def asset_path_wildcard
      "{" + (MODELS_WITH_ASSETS.join ",") + "}"
    end

    def capture_output(command, options = {})
      `#{command} 2>&1`.tap do |output|
        unless $?.success?
          failure_message = options[:error] || "Command '#{command}' failed."
          $stderr.puts [failure_message, output]
          raise failure_message
        end
      end
    end
  end

  class Backup
    include BackupRestore::SharedMethods
    attr_accessor :backup_dir, :rolling_days, :temp_dir

    def initialize(backup_dir, rolling_days = nil)
      rolling_days.nil? || rolling_days > 0 || raise("Must specify a positive integer for the number of rolling days (value was #{rolling_days}).")

      self.backup_dir = File.expand_path(backup_dir)
      FileUtils.mkdir_p backup_dir
      self.rolling_days = rolling_days
    end

    def backup
      SafeMktmpdir.mktmpdir(BACKUP_FILE_PREFIX) do |temp_dir|
        self.temp_dir = Pathname.new(temp_dir)
        Dir.chdir(temp_dir) do
          dump_database
          compress_assets
          package_backup
        end
      end
      delete_old_backups
    end

    def dump_database
      log "Dumping database contents..."

      capture_output "pg_dump -Fc -p #{database_port} #{database_name} | gzip > #{DATABASE_DATA_FILENAME}", :error => "Database dump failed."
    end

    def compress_asset_path(path)
      Dir.chdir config_path(path) do
        asset_list = Dir.glob asset_path_wildcard
        asset_string = asset_list.join " "
        capture_output "tar cz #{asset_string} > #{temp_dir.join path + ".tgz"}",
                       :error => "Compressing assets failed." unless asset_list.empty?
      end
    rescue Errno::ENOENT
    end

    def compress_assets
      log "Compressing assets..."
      ASSET_PATHS.map { |path| compress_asset_path path }
    end

    def delete_old_backups
      return unless rolling_days
      log "Removing backups more than #{rolling_days} #{"day".pluralize(rolling_days)} old..."

      oldest_allowed_timestamp = rolling_days.days.ago.strftime('%Y%m%d_%H%M%S')

      timestamp_matcher = oldest_allowed_timestamp.gsub(/\d/, "?")

      Dir.glob(backup_dir + "/#{BACKUP_FILE_PREFIX}#{timestamp_matcher}.tar") do |filename|
        timestamp = filename.gsub(backup_dir + "/" + BACKUP_FILE_PREFIX, "")

        if timestamp < oldest_allowed_timestamp
          log "Deleting '#{filename}'"
          File.delete(filename)
        end
      end
    end

    def package_backup
      %w{version_build config/chorus.yml}.map {|f|Rails.root.join f}.each do |file|
        FileUtils.cp file, "." if File.exists?(file)
      end

      timestamp = Time.current.strftime '%Y%m%d_%H%M%S'
      backup_filename = File.join(backup_dir, "#{BACKUP_FILE_PREFIX}#{timestamp}.tar")

      capture_output "tar cf #{backup_filename} *", :error => "Packaging failed."
      log "Created backup archive file: #{backup_filename}"
    end
  end

  class Restore
    include BackupRestore::SharedMethods
    attr_accessor :backup_filename, :temp_dir, :do_not_warn_before_restore

    def initialize(backup_filename, do_not_warn)
      self.backup_filename = backup_filename
      self.do_not_warn_before_restore = do_not_warn
    end

    def restore
      prompt_user

      without_connection do
        full_backup_filename = File.expand_path(backup_filename)
        SafeMktmpdir.mktmpdir "greenplum_chorus_restore" do |tmp_dir|
          self.temp_dir = Pathname.new tmp_dir
          Dir.chdir tmp_dir do
            capture_options = {:error => "Could not unpack backup file '#{backup_filename}'"}
            capture_output "tar xf #{full_backup_filename}", capture_options
            backup_version = capture_output("cat version_build", capture_options).strip
            current_version = capture_output("cat #{Rails.root.join 'version_build'}", capture_options).strip

            compare_versions(backup_version, current_version)

            FileUtils.cp "chorus.yml", Rails.root.join("config/chorus.yml") if File.exists?("chorus.yml")
            self.chorus_config = ChorusConfig.new

            restore_assets
            restore_database
          end
        end
        true
      end
    end

    PROMPT = <<PROMPT
Continuing will overwrite existing assets and data. It is strongly advised that
you have a recent backup available before performing a restore.

Are you sure you want to continue? (Y/N):
PROMPT

    def prompt_user
      unless do_not_warn_before_restore

        loop do
          print PROMPT
          input = get_input
          print "#{input}\n"

          input.downcase!

          break if 'y' == input
          exit if 'n' == input
        end
      end
    end

    def get_input
      STDIN.getc
    end

    def restore_assets
      log "Restoring assets..."
      ASSET_PATHS.map { |path| restore_asset_path path }
    end

    def restore_asset_path(path)
      full_path = config_path path
      FileUtils.mkdir_p full_path and Dir.chdir full_path do
        MODELS_WITH_ASSETS.each do |model|
          # TODO: make sure that we only remove top-level model paths that are in the tar ball
          FileUtils.rm_r File.join(path, model) if asset_path_in_tar?(path) rescue Errno::ENOENT
        end

        capture_output "tar xf #{temp_dir.join path + ".tgz"}",
                       :error => "Restoring assets failed."
      end
    end

    def asset_path_in_tar?(path)
      true
    end

    def restore_database
      log "Restoring database..."
      capture_output "dropdb -p #{database_port} #{database_name}", :error => "Existing database could not be dropped."
      capture_output "gunzip -c #{DATABASE_DATA_FILENAME} | pg_restore -C -p #{database_port} -d postgres", :error => "Could not restore database."
    end

    def compare_versions(backup_version, current_version)
      if backup_version != current_version
        raise "Backup version ('#{backup_version}') differs from installed chorus version ('#{current_version}')"
      end
    end

    def without_connection
      existing_connection = ActiveRecord::Base.connection_handler.active_connections?
      if existing_connection
        connection_config = ActiveRecord::Base.connection_config
        ActiveRecord::Base.connection.disconnect!
      end
      yield
    ensure
      ActiveRecord::Base.establish_connection connection_config if existing_connection
    end
  end
end
