COMPONENTS_DIR = File.expand_path("../components", __FILE__)
ROOT = ENV['HOME']
APP_DIR = File.join(ROOT, "chorusrails")
PG_DIR = File.join(ROOT, "pgsql")

def install
  setup_directories
  install_postgres
end

def setup_directories
  run "mkdir -p #{ROOT}/chorusrails/var/db"
end

def install_postgres
  Dir.chdir(COMPONENTS_DIR) do
    run "tar xzf postgres"
  end

  Dir.chdir("postgresql-9.0.4") do
    run "./configure --prefix=#{PG_DIR}"
    run "make"
    run "make install"
  end

  puts "installed postgres to #{PG_DIR}"
end

def start_database
  run "#{PG_DIR}/bin/pg_ctl init -D #{APP_DIR}/var/db -U vagrant"
  run "#{PG_DIR}/bin/pg_ctl start -D #{APP_DIR}/var/db -o '-h localhost -p8543 --bytea_output=escape'"
end

def run(cmd)
  puts cmd
  system cmd
end

install
