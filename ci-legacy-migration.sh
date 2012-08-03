#!/bin/bash

set -e
export RAILS_ENV=test
eval "$(rbenv init -)"

#rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/
b/rake db:drop db:create db:migrate legacy:setup --trace > $WORKSPACE/bundle.log

# start solr
b/rake sunspot:solr:run > $WORKSPACE/solr.log 2>&1 &
solr_pid=$!
echo "Solr process id is : $solr_pid"
echo $solr_pid > tmp/pids/solr-$RAILS_ENV.pid

set +e

echo "Running legacy migration tests"
rspec spec/lib/legacy_migration --tag legacy_migration 2>&1
LEGACY_MIGRATION_TESTS_RESULT=$?

echo "Cleaning up solr process $solr_pid"
kill -s SIGTERM $solr_pid

exit $LEGACY_MIGRATION_TESTS_RESULT