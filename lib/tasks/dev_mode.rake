namespace :devmode do
  desc "Set up devmode, so console.logs show up as e.g. 'chorus$view' instead of just 'child'"
  task :setup do
    `echo 'window.CHORUS_DEV_MODE = true;' >> app/assets/javascripts/environment.js`
  end
end
