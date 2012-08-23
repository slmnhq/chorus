#!/usr/bin/env bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

if [ -d $bin/current/packaging/ ]; then
    bin=$bin/current/packaging
fi

. "$bin"/chorus-config.sh

log_inline "stopping postgres "
$CHORUS_HOME/postgres/bin/pg_ctl -D $POSTGRES_DIR -m fast stop &>/dev/null
wait_for_stop $POSTGRES_PID_FILE