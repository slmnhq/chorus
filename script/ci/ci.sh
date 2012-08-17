#!/bin/bash

. script/ci/setup.sh

set -e
export RAILS_ENV=test

b/rake db:drop db:create db:migrate --trace > $WORKSPACE/bundle.log
b/rake assets:precompile

echo "starting gpfdist (Linux RHEL5 only)"
export LD_LIBRARY_PATH=vendor/gpfdist-rhel5/lib:${LD_LIBRARY_PATH}
./vendor/gpfdist-rhel5/bin/gpfdist -p 8000 -d /tmp &
./vendor/gpfdist-rhel5/bin/gpfdist -p 8001 -d /tmp &

# start jasmine
b/rake jasmine > $WORKSPACE/jasmine.log 2>&1 &
jasmine_pid=$!
echo "Jasmine process id is : $jasmine_pid"
echo $jasmine_pid > tmp/pids/jasmine-$RAILS_ENV.pid

sleep 30

set +e

echo "Running unit tests"
rm tmp/fixture_builder.yml
script/test 2>&1
RUBY_TESTS_RESULT=$?

echo "Running javascript tests"
b/rake phantom 2>&1
JS_TESTS_RESULT=$?

echo "Cleaning up jasmine process $jasmine_pid"
kill -s SIGTERM $jasmine_pid

echo "Cleaning up gpfdist"
killall gpfdist

echo "Running legacy migration tests"
b/rake db:test:prepare
RAILS_ENV=test packaging/chorus_migrate.sh db/legacy/legacy.sql
rspec spec/legacy_migration
LEGACY_MIGRATION_TESTS_RESULT=$?

SUCCESS=`expr $RUBY_TESTS_RESULT + $JS_TESTS_RESULT + $LEGACY_MIGRATION_TESTS_RESULT`
echo "RSpec exit code: $RUBY_TESTS_RESULT"
echo "Jasmine exit code: $JS_TESTS_RESULT"
echo "Legacy migration exit code: $LEGACY_MIGRATION_TESTS_RESULT"
exit $SUCCESS
