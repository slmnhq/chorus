#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

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

POSTGRES_PORT=8543

$CHORUS_HOME/postgres/bin/pg_ctl -l $POSTGRES_DIR/server.log -D $POSTGRES_DIR -w -o "-p$POSTGRES_PORT -h127.0.0.1 --bytea_output=escape" start &>/dev/null
POSTGRES_START=$?

if [ $POSTGRES_START -eq 0 ]; then
    wait_for_start $POSTGRES_PID_FILE
    log "postgres started as pid `head -1 $POSTGRES_PID_FILE`"
else
    log "postgres failed to start, see $POSTGRES_DIR/server.log for details"
    exit $POSTGRES_START
fi