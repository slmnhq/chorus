#!/bin/bash

set -e
export RAILS_ENV=integration

mkdir -p tmp/pids
eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/
b/rake db:drop db:create db:migrate --trace > $WORKSPACE/bundle.log
b/rake assets:precompile

set +e

echo "Running regression tests"
b/rake docs:generate 2>&1
ACCEPTANCE_TESTS_RESULT=$?

echo "RSpec exit code: $ACCEPTANCE_TESTS_RESULT"
exit $ACCEPTANCE_TESTS_RESULT
