#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

POSTGRES_PORT=8543

if [ -f $POSTGRES_PID_FILE ]; then
  if kill -0 `head -1 $POSTGRES_PID_FILE` > /dev/null 2>&1; then
    log "Postgres already running as process `head -1 $POSTGRES_PID_FILE`."
    exit 1
  fi
fi
DYLD_LIBRARY_PATH=$CHORUS_HOME/postgres/lib LD_LIBRARY_PATH=$CHORUS_HOME/postgres/lib $CHORUS_HOME/postgres/bin/pg_ctl -l $POSTGRES_DATA_DIR/server.log -D $POSTGRES_DATA_DIR -w -o "-p$POSTGRES_PORT -h127.0.0.1 --bytea_output=escape" start &>$POSTGRES_DATA_DIR/pg_ctl.log
POSTGRES_START=$?

if [ $POSTGRES_START -eq 0 ]; then
    wait_for_start $POSTGRES_PID_FILE
    log "postgres started as pid `head -1 $POSTGRES_PID_FILE`"
else
    log "postgres failed to start, see $POSTGRES_DATA_DIR/server.log for details"
    exit $POSTGRES_START
fi