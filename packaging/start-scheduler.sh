#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

# depends on postgres

if [ -f $SCHEDULER_PID_FILE ]; then
  if kill -0 `cat $SCHEDULER_PID_FILE` > /dev/null 2>&1; then
    log "Scheduler already running as process `cat $SCHEDULER_PID_FILE`.  Stop it first."
    exit 1
  fi
fi

$RUBY script/rails runner "require 'job_scheduler'; JobScheduler.run" > $CHORUS_HOME/log/scheduler.$RAILS_ENV.log 2>&1 &
scheduler_pid=$!
echo $scheduler_pid > $SCHEDULER_PID_FILE
log "Scheduler started as pid $scheduler_pid"
