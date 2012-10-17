#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

log_inline "stopping postgres "
$CHORUS_HOME/postgres/bin/pg_ctl -D $POSTGRES_DATA_DIR -m fast stop > /dev/null
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    wait_for_stop $POSTGRES_PID_FILE
fi
exit $EXIT_CODE
