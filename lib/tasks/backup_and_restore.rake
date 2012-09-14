namespace :backup do

  desc 'create a backup'
  task :create do
    db_config = Rails.application.config.database_configuration[Rails.env]
    timestamp = Time.current.strftime('%FT%T')
    filename = "backup_#{timestamp}.sql"

    system ("pg_dump -p #{db_config['port']} #{db_config['database']} > #{filename}")
    puts "Wrote file #{filename}"
  end

  desc 'restore from a backup'
  task :restore do
  end

end