#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

if [ -f $SCHEDULER_PID_FILE ]; then
  if kill -0 `cat $SCHEDULER_PID_FILE` > /dev/null 2>&1; then
    log_inline "stopping scheduler "
    kill `cat $SCHEDULER_PID_FILE` && rm $SCHEDULER_PID_FILE
    wait_for_stop $SCHEDULER_PID_FILE
    rm -f $SCHEDULER_PID_FILE
  else
    log "Could not stop scheduler. Check that process `cat $SCHEDULER_PID_FILE` exists"
    exit 1
  fi
else
  log "no scheduler to stop"
fi
