require Rails.root + "app/models/chorus_config"

namespace :backup do

  BACKUP_FILE_PREFIX = "greenplum_chorus_backup_"

  desc 'create a backup'
  task :create, [:backup_dir, :rolling_days] do |t, args|
    begin
      backup_dir = args[:backup_dir]
      rolling_days = (args[:rolling_days] || 7).to_i
      rolling_days > 0 or raise "Must specify a positive integer for the number of rolling days (value was #{rolling_days})."

      temp_dir = Dir.mktmpdir(BACKUP_FILE_PREFIX)
      dump_database(temp_dir)
      compress_assets(temp_dir)
      package_backup(backup_dir, temp_dir)
      delete_old_backups(backup_dir, rolling_days)
    ensure
      system "rm -rf #{temp_dir}"
    end
  end

  def dump_database(temp_dir)
    puts "Dumping database contents..."

    db_config = Rails.application.config.database_configuration[Rails.env]
    db_filename = "database.sql.gz"
    system "pg_dump -p #{db_config['port']} #{db_config['database']} | gzip > #{temp_dir}/#{db_filename}" or raise "Backing up data failed."
  end

  def compress_assets(temp_dir)
    puts "Compressing assets..."

    asset_filename = "assets.tgz"

    files = ['config/chorus.yml',
             config_path('csv_import_file_storage_path'),
             config_path('workfile_storage_path'),
             config_path('image_storage'),
             config_path('attachment_storage')
    ]

    asset_list = files.join ' '
    system "tar czf #{temp_dir}/#{asset_filename} #{asset_list}" or raise "Backing up assets failed."
  end

  def delete_old_backups(backup_dir, rolling_days)
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

  def package_backup(backup_dir, temp_dir)
    system "cp version_build #{temp_dir}" or raise "Could not find version file."

    timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
    backup_filename = "#{backup_dir}/#{BACKUP_FILE_PREFIX}#{timestamp}.tar"

    system "cd #{temp_dir} && (tar cf #{backup_filename} .)" or raise "Packaging backup failed."
    puts "Wrote file #{backup_filename}."
  end

  def config_path(name)
    chorus_config[name].gsub ":rails_root/", ""
  end

  def chorus_config
    @chorus_config ||= ChorusConfig.new
  end

  desc 'restore from a backup'
  task :restore do
  end

end