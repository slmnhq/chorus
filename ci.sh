#!/bin/bash

set -e
eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep "jruby 1.6.7"
gem list bundler | grep bundler || gem install bundler
bundle install
bundle exec rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy

RAILS_ENV=development bundle exec rake devmode:enable assets:precompile
# start jasmine
bundle exec rake jasmine > $WORKSPACE/jasmine.log 2>&1 &
jasmine_pid=$!
echo "Jasmine process id is : $jasmine_pid"
sleep 5

set +e
script/test 2>&1
RUBY_TESTS_RESULT=$?
bundle exec rake phantom 2>&1
JS_TESTS_RESULT=$?
script/test spec/integration/ 2>&1
INTEGRATION_TESTS_RESULT=$?

set -e
echo "Cleaning up jasmine process $jasmine_pid"
kill -s SIGINT $jasmine_pid
SUCCESS=`expr $RUBY_TESTS_RESULT + $JS_TESTS_RESULT + $INTEGRATION_TESTS_RESULT`
exit $SUCCESS
