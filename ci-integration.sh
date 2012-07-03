#!/bin/bash

set -e
eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install
bundle exec rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

RAILS_ENV=development bundle exec rake devmode:enable assets:precompile
RAILS_ENV=test bundle exec rake sunspot:solr:run > $WORKSPACE/solr.log 2>&1 &
solr_pid=$!
echo "Solr process id is : $solr_pid"
sleep 20

set +e
echo "Running integration tests"
rspec spec/integration/ 2>&1
INTEGRATION_TESTS_RESULT=$?

echo "Cleaning up solr process $solr_pid"
kill -s SIGINT $solr_pid

exit $INTEGRATION_TESTS_RESULT
