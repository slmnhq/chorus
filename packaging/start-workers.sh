#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

. "$bin"/chorus-config.sh

STARTING="worker"
depends_on postgres

if [ -f $WORKER_PID_FILE ]; then
  if kill -0 `cat $WORKER_PID_FILE` > /dev/null 2>&1; then
    log "Worker already running as process `cat $WORKER_PID_FILE`."
    exit 1
  fi
fi

$RUBY packaging/update_database_pool_size.rb
RAILS_ENV=$RAILS_ENV $RUBY script/rails runner "ChorusWorker.new.start" >> $CHORUS_HOME/log/worker.$RAILS_ENV.log 2>&1 &
worker_pid=$!
echo $worker_pid > $WORKER_PID_FILE
log "Worker started as pid $worker_pid"
