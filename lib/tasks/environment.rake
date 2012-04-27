namespace :devmode do
  desc 'Create file to enable chorus.isDevMode()'
  task :enable do
      system("echo 'window.CHORUS_DEV_MODE = true;' > #{File.dirname(__FILE__)}/../../app/assets/javascripts/environment.js")
  end

  desc 'Delete file that enables chorus.isDevMode()'
  task :disable do
      system("rm #{File.dirname(__FILE__)}/../../app/assets/javascripts/environment.js")
  end
end
