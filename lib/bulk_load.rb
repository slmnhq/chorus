rails_db = "chorus_rails_test"

# Cleanup to prepare for legacy migration
system "rake db:test:prepare"
system "dropdb -p 8543 tmp_migrate"
system "psql -p 8543 #{rails_db} -c 'drop schema legacy_migrate cascade'"

# Create a temporary database so we can namespace legacy tables into their own schema
system "createdb -p 8543 tmp_migrate"
system "psql -p 8543 tmp_migrate < db/legacy/legacy.sql"
system "psql -p 8543 tmp_migrate -c 'alter schema public rename to legacy_migrate'"

# Pipe the output of pg_dump into the chorus_rails db, namespaced under legacy_migrate
system "pg_dump -p 8543 tmp_migrate | psql -p 8543 #{rails_db}"
