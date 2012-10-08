module BackupRestore
  BACKUP_FILE_PREFIX = "greenplum_chorus_backup_"

  def self.backup(*args)
    backup = Backup.new *args
    backup.run
  end

  class Backup
    attr_accessor :backup_dir, :rolling_days

    def initialize(backup_dir, rolling_days)
      rolling_days > 0 or raise "Must specify a positive integer for the number of rolling days (value was #{rolling_days})."

      self.backup_dir = backup_dir
      self.rolling_days = rolling_days
    end

    def run
      temp_dir = Dir.mktmpdir(BACKUP_FILE_PREFIX)
      begin
        Dir.chdir(temp_dir) do
          dump_database
          compress_assets
          package_backup
        end
      ensure
        system "rm -rf #{temp_dir}" or raise "Could not remove temporary directory: #{temp_dir}"
      end
      delete_old_backups
    end

    def dump_database
      puts "Dumping database contents..."

      db_config = Rails.application.config.database_configuration[Rails.env]
      db_filename = "database.sql.gz"
      system "pg_dump -p #{db_config['port']} #{db_config['database']} | gzip > #{db_filename}" or raise "Backing up data failed."
    end

    def compress_assets
      puts "Compressing assets..."

      asset_filename = "assets.tgz"

      files = ['config/chorus.yml',
               config_path('csv_import_file_storage_path'),
               config_path('workfile_storage_path'),
               config_path('image_storage'),
               config_path('attachment_storage')
      ]

      asset_list = files.join ' '
      system "(cd #{Rails.root} && tar cz #{asset_list}) > #{asset_filename}" or raise "Backing up assets failed."
    end

    def delete_old_backups
      puts "Removing backups more than #{rolling_days} #{"day".pluralize(rolling_days)} old..."

      oldest_allowed_timestamp = rolling_days.days.ago.strftime('%Y%m%d_%H%M%S')

      timestamp_matcher = oldest_allowed_timestamp.gsub(/\d/,"?")

      Dir.glob(backup_dir + "/#{BACKUP_FILE_PREFIX}#{timestamp_matcher}.tar") do |filename|
        timestamp = filename.gsub(backup_dir + "/" + BACKUP_FILE_PREFIX, "")

        if timestamp < oldest_allowed_timestamp
          puts "Deleting '#{filename}'"
          File.delete(filename)
        end
      end
    end

    def package_backup
      system "cp #{Rails.root}/version_build ." or raise "Could not find version file."

      timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
      backup_filename = backup_dir + "/#{BACKUP_FILE_PREFIX}#{timestamp}.tar"

      system "tar cf #{backup_filename} *" or raise "Packaging backup failed."
      puts "Wrote file #{backup_filename}."
    end

    def config_path(name)
      chorus_config[name].gsub ":rails_root/", ""
    end

    def chorus_config
      @chorus_config ||= ChorusConfig.new
    end
  end
end
