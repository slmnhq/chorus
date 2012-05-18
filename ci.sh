#!/bin/bash

set -e

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep 1.9.3
gem list bundler | grep bundler || gem install bundler
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

# Run rspec unit tests
script/test 2>&1

# Run Jasmine tests

# start jasmine
bundle exec rake jasmine > $WORKSPACE/jasmine.log 2>&1 &
jasmine_pid=$!
echo "Jasmine process id is : $jasmine_pid"
sleep 5

RAILS_ENV=development rake devmode:enable assets:precompile
rake phantom 2>&1
echo "Cleaning up jasmine process $jasmine_pid"
kill $jasmine_pid

# Run integration tests
script/test spec/integration/ 2>&1

