COMPONENTS_DIR = File.expand_path("../components", __FILE__)
ROOT = ENV['HOME']
APP_DIR = File.join(ROOT, "app")
PG_DIR = File.join(ROOT, "pgsql")
RUBY_DIR = File.join(ROOT, "ruby")

def install
  setup_directories
  install_postgres
  start_database
  install_ruby #TODO: need LibYAML

  install_rubygems_and_bundler
  puts "Installing chorus..."
  install_chorus
  run_chorus
end

def setup_directories
  run "mkdir -p #{ROOT}/app/var/db"
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
  sleep(5)
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

def install_chorus
  Dir.chdir(ROOT) do
    run "tar xzf #{COMPONENTS_DIR}/app.tar.gz"
  end

  Dir.chdir(APP_DIR) do
    run "bundle config build.pg --with-pg-config=/home/vagrant/pgsql/bin/pg_config --with-pg-dir=/home/vagrant/pgsql/"
    run "bundle install"
    run "bundle exec rake db:create"
    run "bundle exec rake db:migrate"
    run "bundle exec rake db:seed"
  end
end

def run_chorus
  Dir.chdir(APP_DIR) do
    run "bundle exec rails s -d"
  end
end

def run(cmd)
  puts cmd
  system "export LD_LIBRARY_PATH=/home/vagrant/pgsql/lib/:$LD_LIBRARY_PATH && export RAILS_ENV=production && export PATH=/home/vagrant/pgsql/bin:/home/vagrant/rubygems/bin:/home/vagrant/ruby/lib/ruby/gems/1.9.1/gems/bundler-1.1.3/bin/:/home/vagrant/ruby/bin:$PATH && #{cmd}" 
end

install
