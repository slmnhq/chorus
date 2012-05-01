#!/bin/bash

set -e

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep 1.9.3
gem list bundler | grep bundler || gem install bundler
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

# Run rspec unit tests
script/test > $CC_BUILD_ARTIFACTS/rspec_tests.log 2>&1

# Run Jasmine tests
RAILS_ENV=development rake devmode:enable assets:precompile
rake jasmine:ci > $CC_BUILD_ARTIFACTS/jasmine_tests.log 2>&1

# Run integration tests
script/test spec/integration/working_specs.rb > $CC_BUILD_ARTIFACTS/integration_tests.log 2>&1
