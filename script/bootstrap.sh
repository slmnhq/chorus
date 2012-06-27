#!/bin/bash

ruby_version=`cat .rbenv-version`
SCRIPT_DIR=`dirname $0`
CHORUSDIR=${HOME}/workspace/chorusrails

pg_ctl start -D ${CHORUSDIR}/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5

$SCRIPT_DIR/bootstrap-rbenv.sh
$SCRIPT_DIR/bootstrap-ruby.sh $ruby_version
set -e

## source $SCRIPT_DIR/rbenv.sh

echo "***** initializing database"
${HOME}/workspace/chorusrails/script/init_db.sh
$SCRIPT_DIR/bootstrap-queue.sh

echo "***** installing hadoop"
${HOME}/workspace/chorusrails/script/install_hdfs_service.sh

echo "***** setting up project"
bundle
rake db:reset legacy:setup db:test:prepare:legacy
${HOME}/workspace/chorusrails/script/test
pg_ctl stop -D ${CHORUSDIR}/var/db