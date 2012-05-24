COMPONENTS_DIR = File.expand_path("../components", __FILE__)
ROOT = ENV['HOME']
APP_DIR = File.join(ROOT, "chorusrails")
PG_DIR = File.join(ROOT, "pgsql")
RUBY_DIR = File.join(ROOT, "ruby")

def install
  setup_directories
  install_postgres
  start_database
  install_ruby #TODO: need LibYAML
  install_rubygems_and_bundler
  puts "Setting up environment..."
  setup_environment
  puts "Installing chorus..."
  install_chorus
  run_chorus
end

def setup_directories
  run "mkdir -p #{ROOT}/chorusrails/var/db"
end

def install_postgres
  Dir.chdir(COMPONENTS_DIR) do
    run "tar xzf postgres"
     Dir.chdir("postgresql-9.0.4") do
      run "./configure --prefix=#{PG_DIR}"
      run "make"
      run "make install"
    end
  end

  puts "installed postgres to #{PG_DIR}"
end

def start_database
  run "#{PG_DIR}/bin/pg_ctl init -D #{APP_DIR}/var/db -U vagrant"
  run "#{PG_DIR}/bin/pg_ctl start -D #{APP_DIR}/var/db -o '-h localhost -p8543 --bytea_output=escape'"
  run "#{PG_DIR}/bin/createuser -h localhost -p 8543 -sdr edcadmin"
  sleep(5)
end

def install_ruby
  puts "Installing ruby into #{COMPONENTS_DIR}..."
  Dir.chdir(COMPONENTS_DIR) do
    run "tar xzf ruby"
    Dir.chdir("ruby-1.9.3-p125") do
        run("./configure --prefix=#{RUBY_DIR}")
        run ("make")
        run("make install")
    end
  end
end

def install_rubygems_and_bundler
  Dir.chdir(COMPONENTS_DIR) do
    run "tar xzf rubygems"
    Dir.chdir("rubygems-1.8.24") do
      run "#{RUBY_DIR}/bin/ruby setup.rb --prefix=~/rubygems/"
    end
    run "#{ROOT}/rubygems/bin/gem install --local bundler-1.1.3.gem --no-ri --no-rdoc"
    puts "Finished installing bundler"
  end
end

def setup_environment
  # Perhaps write a Bashrc to set these environment variables.
  run "export RAILS_ENV=production"
  run "export PATH=/home/vagrant/ruby/bin:$PATH"
  run "export PATH=/home/vagrant/rubygems/bin:$PATH"
  run "export PATH=/home/vagrant/ruby/lib/ruby/gems/1.9.1/gems/bundler-1.1.3/bin/:$PATH"
  run "export PATH=/home/vagrant/pgsql/bin:$PATH"
  run "export LD_LIBRARY_PATH=/home/vagrant/pgsql/lib/"
end

def install_chorus
  Dir.chdir(ROOT) do
    run "tar xzf #{COMPONENTS_DIR}/app.tar.gz"
  end

  Dir.chdir(APP_DIR) do
    run "bundle install --local"
    run "gem install pg --local vendor/cache/pg-0.13.2.gem -- --with-pg-config=#{PG_DIR}/bin/pg_config --with-pg-dir=#{PG_DIR}"
    run "bundle exec rake db:create"
    run "bundle exec rake db:migrate"
    run "bundle exec rake db:seed"
  end
end

def run_chorus
  Dir.chdir(APP_DIR) do
    run "bundle exec rails s &"
    sleep(10)
  end
end

def run(cmd)
  puts cmd
  system cmd
end

install
exit(0)