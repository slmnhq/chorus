require Rails.root + "app/models/chorus_config"

namespace :backup do

  desc 'create a backup'
  task :create, [:backup_dir, :rolling_days] do |t, args|
    begin
      backup_dir = args[:backup_dir]
      rolling_days = args[:rolling_days]

      db_config = Rails.application.config.database_configuration[Rails.env]
      timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
      db_filename = "database.sql.gz"

      temp_dir = Dir.mktmpdir("greenplum_chorus_backup_")

      puts "Dumping database contents..."
      system "pg_dump -p #{db_config['port']} #{db_config['database']} | gzip > #{temp_dir}/#{db_filename}" or raise "Backing up data failed."

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

      system "cp version_build #{temp_dir}" or raise "Backing up version_build file failed."

      backup_filename = "#{backup_dir}/greenplum_chorus_#{timestamp}.tar"
      system "cd #{temp_dir} && (tar cf #{backup_filename} .)" or raise "Packaging backup failed."
      puts "Wrote file #{backup_filename}."
    ensure
      system "rm -rf #{temp_dir}"
    end
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