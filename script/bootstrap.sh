#!/bin/bash

ruby_version=`cat .rbenv-version`
SCRIPT_DIR=`dirname $0`

$SCRIPT_DIR/bootstrap-rbenv.sh
$SCRIPT_DIR/bootstrap-ruby.sh $ruby_version

set -e

# source $SCRIPT_DIR/rbenv.sh

echo "***** setting up project"
bundle install
rake db:create db:migrate db:test:prepare legacy:setup db:test:prepare:legacy
script/test
