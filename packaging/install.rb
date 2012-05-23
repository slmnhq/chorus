COMPONENTS_DIR = File.expand_path("../components", __FILE__)
ROOT = ENV['HOME']
APP_DIR = File.join(ROOT, "chorusrails")
PG_DIR = File.join(ROOT, "pgsql")
RUBY_DIR = File.join(ROOT, "ruby")

def install
  setup_directories
  install_postgres
  start_database
  create_database
  install_ruby #TODO: need LibYAML
  install_rubygems_and_bundler
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

def create_database
  run "#{PG_DIR}/bin/createdb -p 8543 chorus_rails_production"
end

def start_database
  run "#{PG_DIR}/bin/pg_ctl init -D #{APP_DIR}/var/db -U vagrant"
  run "#{PG_DIR}/bin/pg_ctl start -D #{APP_DIR}/var/db -o '-h localhost -p8543 --bytea_output=escape'"
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
  end
end

def run(cmd)
  puts cmd
  system cmd
end

install