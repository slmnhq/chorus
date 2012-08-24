#!/usr/bin/env bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

if [ -d $bin/current/packaging/ ]; then
    bin=$bin/current/packaging
fi

. "$bin"/chorus-config.sh

# TODO: this goes away when all development machines have been converted
if [ "$RAILS_ENV" = "development" ]; then
    if [[ ( ! -d $POSTGRES_DIR ) && ( -d $CHORUS_HOME/var/db ) ]]; then
        log "stopping old postgres"
        $CHORUS_HOME/postgres/bin/pg_ctl -D $CHORUS_HOME/var/db -m fast stop
        log "moving postgres db files"
        mv $CHORUS_HOME/var/db $POSTGRES_DIR
    fi
fi
# TODO: end going away

POSTGRES_PORT=9543

$CHORUS_HOME/postgres/bin/pg_ctl -l $POSTGRES_DIR/server.log -D $POSTGRES_DIR -o "-p$POSTGRES_PORT -h127.0.0.1 --bytea_output=escape" start &>/dev/null

wait_for_start $POSTGRES_PID_FILE
log "postgres started as pid `head -1 $POSTGRES_PID_FILE`"