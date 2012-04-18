#!/bin/sh

source "$HOME/.rvm/scripts/rvm"
source ./.rvmrc
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
