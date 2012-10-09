#!/bin/bash

ruby_version=`cat .rbenv-version`
SCRIPT_DIR=`dirname $0`
CHORUSDIR=${HOME}/workspace/chorusrails

$SCRIPT_DIR/bootstrap-rbenv.sh
$SCRIPT_DIR/bootstrap-ruby.sh $ruby_version
set -e

echo "***** initializing database"
${HOME}/workspace/chorusrails/script/init_db.sh bootstrap

#pg_ctl start -D ${CHORUSDIR}/var/db -o "-h localhost -p8543 --bytea_output=escape"
#sleep 5

$SCRIPT_DIR/bootstrap-queue.sh

echo "***** setting up project"
bundle
${HOME}/workspace/chorusrails/script/ci-test
pg_ctl stop -D ${CHORUSDIR}/var/db