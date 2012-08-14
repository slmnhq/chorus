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
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_user ADD COLUMN chorus_rails_user_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.instances ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_instance ADD COLUMN chorus_rails_instance_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.instance_accounts ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_account_map ADD COLUMN chorus_rails_instance_account_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.workspaces ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_workspace ADD COLUMN chorus_rails_workspace_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.memberships ADD COLUMN legacy_id VARCHAR;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_member ADD COLUMN chorus_rails_membership_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_work_file ADD COLUMN chorus_rails_workfile_id INTEGER;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_workfile_version ADD COLUMN chorus_rails_workfile_version_id INTEGER;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_workfile_draft ADD COLUMN chorus_rails_workfile_draft_id INTEGER;'"
system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE legacy_migrate.edc_dataset ADD COLUMN chorus_rails_associated_dataset_id INTEGER;'"

system "psql -p 8543 chorus_rails_test -c 'ALTER TABLE public.datasets ADD COLUMN legacy_id VARCHAR;'"