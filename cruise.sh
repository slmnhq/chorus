#!/bin/bash

set -e

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep 1.9.3
gem list bundler | grep bundler || gem install bundler
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

# Run rspec tests
script/test  > $CC_BUILD_ARTIFACTS/rspec_tests.log 2>&1

# Start Jasmine
bundle exec rake jasmine > $CC_BUILD_ARTIFACTS/jasmine.log 2>&1 &
JASMINE_PID=$!; sleep 5

# Run Jasmine tests
rake phantom > $CC_BUILD_ARTIFACTS/jasmine_tests.log 2>&1
kill -9 $JASMINE_PID || true