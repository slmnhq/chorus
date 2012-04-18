#!/bin/bash

source "$HOME/.rvm/scripts/rvm"
source ./.rvmrc
ruby -v
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
