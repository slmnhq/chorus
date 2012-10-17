#!/bin/bash

export RAILS_ENV=integration
export GPDB_HOST=chorus-gpdb42

. script/ci/setup.sh

set -e

b/rake assets:precompile

# start solr
b/rake services:solr:run > $WORKSPACE/solr.log 2>&1 &
solr_pid=$!
echo "Solr process id is : $solr_pid"
echo $solr_pid > tmp/pids/solr-$RAILS_ENV.pid
sleep 20

set +e

echo "Running integration tests"
b/rake -f `bundle show ci_reporter`/stub.rake ci:setup:rspec spec:integration 2>&1
INTEGRATION_TESTS_RESULT=$?

echo "Cleaning up solr process $solr_pid"
kill -s SIGTERM $solr_pid

echo "Cleaning assets"
b/rake assets:clean

echo "RSpec exit code: $INTEGRATION_TESTS_RESULT"
exit $INTEGRATION_TESTS_RESULT
