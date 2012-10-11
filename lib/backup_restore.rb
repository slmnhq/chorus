require 'safe_mktmpdir'
require 'pathname'

module BackupRestore
  BACKUP_FILE_PREFIX = "greenplum_chorus_backup_"
  DATABASE_SQL_FILENAME = "database.sql.gz"
  ASSETS_FILENAME = "assets.tgz"
  MODELS_WITH_ASSETS = %w{csv_files attachments note_attachments users workfile_versions workspaces}
  ASSET_PATHS = %w{csv_import_file_storage_path workfile_storage_path image_storage attachment_storage}

  def self.backup(backup_dir, rolling_days = nil)
    Backup.new(backup_dir, rolling_days).backup
  end

  def self.restore(backup_filename)
    Restore.new(backup_filename).restore
  end

  module SharedMethods
    def log(*args)
      puts *args
    end

    def database_params
      db_config = Rails.application.config.database_configuration[Rails.env]
      "-p #{db_config['port']} #{db_config['database']}"
    end

    def config_path(name)
      raise "Could not find path for ''#{name}' in chorus_config.yml" unless chorus_config[name]
      chorus_config[name].gsub ":rails_root", Rails.root.to_s
    end

    def chorus_config
      @chorus_config ||= ChorusConfig.new
    end

    def asset_path_wildcard
      "{" + (MODELS_WITH_ASSETS.join ",") + "}"
    end

    def capture_output(command, options = {})
      `#{command} 2>&1`.tap do |output|
        failure_message = options[:error] || "Command '#{command}': #{output}"
        raise failure_message unless $?.success?
      end
    end
  end

  class Backup
    include BackupRestore::SharedMethods
    attr_accessor :backup_dir, :rolling_days, :temp_dir

    def initialize(backup_dir, rolling_days = nil)
      rolling_days ||= 7
      rolling_days > 0 or raise "Must specify a positive integer for the number of rolling days (value was #{rolling_days})."

      self.backup_dir = File.expand_path(backup_dir)
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

      db_filename = "#{DATABASE_SQL_FILENAME}"
      capture_output "pg_dump #{database_params} | gzip > #{db_filename}", :error => "Database dump failed."
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
      %w{version_build config/chorus.yml}.each do |file|
        FileUtils.cp Rails.root.join(file), "."
      end

      timestamp = Time.current.strftime '%Y%m%d_%H%M%S'
      backup_filename = backup_dir + "/#{BACKUP_FILE_PREFIX}#{timestamp}.tar"

      capture_output "tar cf #{backup_filename} *", :error => "Packaging failed."
      log "Wrote file #{backup_filename}."
    end
  end

  class Restore
    include BackupRestore::SharedMethods
    attr_accessor :backup_filename

    def initialize(backup_filename)
      self.backup_filename = backup_filename
    end

    def restore
      full_backup_filename = File.expand_path(backup_filename)
      catch(:unpack_failed) do
        SafeMktmpdir.mktmpdir do |tmp_dir|
          Dir.chdir tmp_dir do
            capture_output_or_throw "tar xf #{full_backup_filename}", :unpack_failed
            backup_version = capture_output_or_throw("cat version_build", :unpack_failed).strip
            current_version = capture_output_or_throw("cat #{Rails.root.join 'version_build'}", :unpack_failed).strip
            compare_versions(backup_version, current_version)
            restore_assets
            restore_database
          end
        end
        true
      end or raise "Could not unpack backup file '#{backup_filename}'"
    end

    def restore_assets
      tmp_dir = Dir.pwd
      FileUtils.rm_r asset_paths
      Dir.chdir(Rails.root) do
        capture_output "tar zxf #{tmp_dir}/#{ASSETS_FILENAME}", :error => "Could not uncompress assets."
      end
    end

    def restore_database
      capture_output "gunzip -c database.sql.gz | pg_restore #{database_params}", :error => "Could not restore database."
    end

    def compare_versions(backup_version, current_version)
      if backup_version != current_version
        raise "Backup version ('#{backup_version}') differs from installed chorus version ('#{current_version}')"
      end
    end

    def capture_output_or_throw(command, ball)
      capture_output(command, :error => "throw instead!")
    rescue => e
      throw ball if e.message == "throw instead!"
      raise e
    end
  end
end
