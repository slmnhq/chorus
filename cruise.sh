#!/bin/sh

source ./.rvmrc
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
