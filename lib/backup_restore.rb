module BackupRestore
  BACKUP_FILE_PREFIX = "greenplum_chorus_backup_"
  DATABASE_SQL_FILENAME = "database.sql.gz"
  ASSETS_FILENAME = "assets.tgz"

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
      chorus_config[name].gsub ":rails_root", Rails.root
    end

    def chorus_config
      @chorus_config ||= ChorusConfig.new
    end

    def asset_paths
      [Rails.root.join("config/chorus.yml"),
       config_path('csv_import_file_storage_path'),
       config_path('workfile_storage_path'),
       config_path('image_storage'),
       config_path('attachment_storage')]
    end

    def capture_output(command, options = {})
      `#{command} 2>& 1`.tap do |output|
        failure_message = options[:error] || output
        raise failure_message unless $?.success?
      end
    end
  end

  class Backup
    include BackupRestore::SharedMethods
    attr_accessor :backup_dir, :rolling_days

    def initialize(backup_dir, rolling_days = nil)
      rolling_days ||= 7
      rolling_days > 0 or raise "Must specify a positive integer for the number of rolling days (value was #{rolling_days})."

      self.backup_dir = File.expand_path(backup_dir)
      self.rolling_days = rolling_days
    end

    def backup
      temp_dir = Dir.mktmpdir(BACKUP_FILE_PREFIX)
      begin
        Dir.chdir(temp_dir) do
          dump_database
          compress_assets
          package_backup
        end
      ensure
        FileUtils.rm_r temp_dir or raise "Could not remove temporary directory: #{temp_dir}"
      end
      delete_old_backups
    end

    def dump_database
      log "Dumping database contents..."

      db_filename = "#{DATABASE_SQL_FILENAME}"
      capture_output "pg_dump #{database_params} | gzip > #{db_filename}", :error => "Database dump failed."
    end

    def compress_assets
      log "Compressing assets..."

      asset_filename = "#{ASSETS_FILENAME}"
      asset_list = asset_paths.join ' '
      capture_output "(cd #{Rails.root} && tar cz #{asset_list}) > #{asset_filename}", :error => "Compressing assets failed."
      raise "Compressing assets failed." unless $?.success?
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
      FileUtils.cp "#{Rails.root}/version_build", "."

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
        Dir.mktmpdir do |tmp_dir|
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
      FileUtils.rm_r asset_paths.uniq
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
