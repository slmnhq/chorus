#!/bin/sh

source "$HOME/.rvm/scripts/rvm"
rvm use 1.9.3-p125
ruby -v
gem list
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
