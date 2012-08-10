#!/bin/bash

set -e
export RAILS_ENV=test
eval "$(rbenv init -)"

#rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/
b/rake db:drop db:create db:migrate legacy:setup --trace > $WORKSPACE/bundle.log

set +e

echo "Running legacy migration tests"
script/test spec/lib/legacy_migration --tag legacy_migration 2>&1
LEGACY_MIGRATION_TESTS_RESULT=$?

exit $LEGACY_MIGRATION_TESTS_RESULT