#!/bin/bash

set -e

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep 1.9.3
gem list bundler | grep bundler || gem install bundler
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

# Run rspec unit tests
script/test 2>&1 | tee $WORKSPACE/rspec_tests.log

# Run Jasmine tests

# start jasmine
ps aux | grep jasmine | grep -v grep | awk '{print $2}' | xargs kill -9
bundle exec rake jasmine 2>&1 | tee $WORKSPACE/jasmine.log  &
jasmine_pid=$!
echo $jasmine_pid
sleep 5

RAILS_ENV=development rake devmode:enable assets:precompile
rake phantom 2>&1 | tee $WORKSPACE/jasmine_tests.log

# Run integration tests
script/test spec/integration/ 2>&1 | tee $WORKSPACE/integration_tests.log
