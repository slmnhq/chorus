#!/bin/bash

. script/ci/setup.sh

set -e
export RAILS_ENV=test

b/rake db:drop db:create db:migrate legacy:setup --trace > $WORKSPACE/bundle.log

set +e

echo "Running legacy migration tests"
script/test spec/lib/legacy_migration --tag legacy_migration 2>&1
LEGACY_MIGRATION_TESTS_RESULT=$?

exit $LEGACY_MIGRATION_TESTS_RESULT