bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

if [ -f $SCHEDULER_PID_FILE ]; then
  if kill -0 `cat $SCHEDULER_PID_FILE` > /dev/null 2>&1; then
    log "stopping scheduler"
    kill `cat $SCHEDULER_PID_FILE` && rm $SCHEDULER_PID_FILE
  else
    log "Could not stop scheduler. Check that process `cat $SCHEDULER_PID_FILE` exists"
    exit 1
  fi
else
  log "no scheduler to stop"
fi
