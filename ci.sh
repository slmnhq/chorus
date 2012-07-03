#!/bin/bash

set -e
export RAILS_ENV=test

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install
bundle exec rake db:drop db:create db:migrate db:seed legacy:setup assets:precompile --trace

# start jasmine
bundle exec rake jasmine > $WORKSPACE/jasmine.log 2>&1 &
jasmine_pid=$!
echo "Jasmine process id is : $jasmine_pid"

set +e
echo "Running unit tests"
script/test 2>&1
RUBY_TESTS_RESULT=$?

echo "Running javascript tests"
bundle exec rake phantom 2>&1
JS_TESTS_RESULT=$?

set -e
echo "Cleaning up jasmine process $jasmine_pid"
kill -s SIGINT $jasmine_pid

SUCCESS=`expr $RUBY_TESTS_RESULT + $JS_TESTS_RESULT`
exit $SUCCESS
