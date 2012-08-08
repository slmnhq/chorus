#!/bin/bash

set -e
export RAILS_ENV=test

mkdir -p tmp/pids
eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install --binstubs=b/
b/rake db:drop db:create db:migrate --trace > $WORKSPACE/bundle.log
b/rake assets:precompile

# start jasmine
b/rake jasmine > $WORKSPACE/jasmine.log 2>&1 &
jasmine_pid=$!
echo "Jasmine process id is : $jasmine_pid"
echo $jasmine_pid > tmp/pids/jasmine-$RAILS_ENV.pid

sleep 30

set +e

echo "Running unit tests"
script/test 2>&1
RUBY_TESTS_RESULT=$?

echo "Running javascript tests"
b/rake phantom 2>&1
JS_TESTS_RESULT=$?

echo "Cleaning up jasmine process $jasmine_pid"
kill -s SIGTERM $jasmine_pid

SUCCESS=`expr $RUBY_TESTS_RESULT + $JS_TESTS_RESULT`
echo "RSpec exit code: $RUBY_TESTS_RESULT"
echo "Jasmine exit code: $JS_TESTS_RESULT"
exit $SUCCESS
