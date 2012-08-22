#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

log "stopping postgres"
$CHORUS_HOME/postgres/bin/pg_ctl -D $POSTGRES_DIR -m fast stop