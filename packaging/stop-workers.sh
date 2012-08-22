bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

if [ -f $WORKER_PID_FILE ]; then
  if kill -0 `cat $WORKER_PID_FILE` > /dev/null 2>&1; then
    log_inline "stopping workers "
    kill `cat $WORKER_PID_FILE`
    while kill -0 `cat $WORKER_PID_FILE` > /dev/null 2>&1
    do
        echo -n "."
        sleep 5
    done
    echo " Stopped"
    rm $WORKER_PID_FILE
  else
    log "Could not stop worker. Check that process `cat $WORKER_PID_FILE` exists"
    exit 1
  fi
else
  log "no worker to stop"
fi
