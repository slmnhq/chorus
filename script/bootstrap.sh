#!/bin/bash

ruby_version=`cat .rbenv-version`
SCRIPT_DIR=`dirname $0`

$SCRIPT_DIR/bootstrap-rbenv.sh
$SCRIPT_DIR/bootstrap-ruby.sh $ruby_version
$SCRIPT_DIR/bootstrap-queue.sh

set -e

# source $SCRIPT_DIR/rbenv.sh

echo "***** initializing database"
script/init_db.sh

echo "***** installing hadoop"
script/install_hadoop.sh

echo "***** setting up project"
bundle install
rake db:reset db:test:prepare legacy:setup db:test:prepare:legacy
script/test
