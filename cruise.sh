#!/bin/bash

set -e
set -x

eval "$(rbenv init -)"
rbenv shell `cat .rbenv-version`
ruby -v | grep 1.9.3
gem list bundler | grep bundler || gem install bundler
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
