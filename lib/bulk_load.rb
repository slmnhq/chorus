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

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.users ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.hadoop_instances ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.instances ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.instance_accounts ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.workspaces ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.memberships ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.workfiles ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.workfile_versions ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.workfile_drafts ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.associated_datasets ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.events ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.datasets ADD COLUMN legacy_id VARCHAR;'"
