require Rails.root + "app/models/chorus_config"

namespace :backup do

  desc 'create a backup'
  task :create, [:backup_dir, :rolling_days] do |t, args|
    begin
      backup_dir = args[:backup_dir]
      rolling_days = args[:rolling_days]

      db_config = Rails.application.config.database_configuration[Rails.env]
      timestamp = Time.current.strftime('%Y%m%d_%H%M%S')
      db_filename = "#{backup_dir}/greenplum_chorus_pg_db_#{timestamp}.sql.gz"

      system "pg_dump -p #{db_config['port']} #{db_config['database']} | gzip > #{db_filename}" or raise "Backing up data failed."
      puts "Wrote file #{db_filename}"

      puts "Backing up assets..."
      asset_filename = "#{backup_dir}/greenplum_chorus_assets_#{timestamp}.tgz"

      files = ['config/chorus.yml',
               config_path('csv_import_file_storage_path'),
               config_path('workfile_storage_path'),
               config_path('image_storage'),
               config_path('attachment_storage')
      ]

      asset_list = files.join ' '
      system "tar czf #{asset_filename} #{asset_list}" or raise "Backing up assets failed."

      puts "Wrote file #{asset_filename}"
    rescue => e
      system "rm -f #{db_filename} #{asset_filename}"
      raise e
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