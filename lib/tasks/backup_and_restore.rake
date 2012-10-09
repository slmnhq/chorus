require Rails.root + "app/models/chorus_config"
require "backup_restore"

namespace :backup do

  desc 'create a backup'
  task :create, [:backup_dir, :rolling_days] do |t, args|
    BackupRestore.backup args[:backup_dir], args[:rolling_days] && args[:rolling_days].to_i
  end

  desc 'restore from a backup'
  task :restore do
  end
end