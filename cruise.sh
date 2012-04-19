#!/bin/bash

set -e
set -x

ruby -v | grep 1.9.3
bundle install
rake legacy:setup db:migrate db:test:prepare db:test:prepare:legacy
script/test
