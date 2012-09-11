#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

STARTING="scheduler"
depends_on postgres

if [ -f $SCHEDULER_PID_FILE ]; then
  if kill -0 `cat $SCHEDULER_PID_FILE` > /dev/null 2>&1; then
    log "Scheduler already running as process `cat $SCHEDULER_PID_FILE`."
    exit 1
  fi
fi

RAILS_ENV=$RAILS_ENV $RUBY script/rails runner "JobScheduler.run" >> $CHORUS_HOME/log/scheduler.$RAILS_ENV.log 2>&1 &
scheduler_pid=$!
echo $scheduler_pid > $SCHEDULER_PID_FILE
log "Scheduler started as pid $scheduler_pid"
