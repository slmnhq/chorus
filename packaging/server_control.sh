#!/bin/bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

test "$RAILS_ENV" = "" && RAILS_ENV=production

POSTGRES_PORT=8543
SOLR_ATTEMPTS=200

STARTING_DIR=$(pwd)
SCRIPT_DIR=$(dirname $0)
cd $STARTING_DIR/$SCRIPT_DIR

CHORUS_LOG=$CHORUS_HOME/log
CHORUS_PID=$CHORUS_HOME/tmp/pids
mkdir -p $CHORUS_PID

WORKER_PID_FILE=$CHORUS_PID/queue_classic.$RAILS_ENV.pid

function pid_is_running () {
  test -z "$1" && return 1;

  ps x | grep "^\s*$1\b" > /dev/null
  return $?
}

function start_postgres () {
  echo "Starting postgres..."
  cd $CHORUS_HOME
  $CHORUS_HOME/postgres/bin/pg_ctl -D $CHORUS_HOME/shared/db -o "-p$POSTGRES_PORT -h127.0.0.1" --bytea_output=escape start > /dev/null 2>&1
}

function start_worker () {
  test ! -e $CHORUS_PID && echo "PID FOLDER DOES NOT EXIST!! Skipping ..." && return 1
  pid_is_running "$(cat $WORKER_PID_FILE 2> /dev/null)"
  worker_pid_present=$?

  # Remember that 1 is FALSE in bash!
  if [ $worker_pid_present -eq 1 ]
  then
    echo "Starting worker..."
    cd $CHORUS_HOME
    bin/ruby script/rails runner script/start_worker.rb > $CHORUS_LOG/queue_classic.$RAILS_ENV.log 2>&1 &
    echo $! > $WORKER_PID_FILE
  else
    echo "Worker is still running..."
  fi
}

function start_scheduler () {
  $bin/start-scheduler.sh
}

function start_solr () {
  $bin/start-solr.sh
}

function start_webserver () {
  $bin/start-webserver.sh
}

function stop_worker () {
  cd $CHORUS_HOME

  if [ -e $WORKER_PID_FILE ]
  then
    echo "Stopping worker..."

     # Both are necessary due to qc:work implementation
    cat $WORKER_PID_FILE | xargs kill
    cat $WORKER_PID_FILE | xargs kill

    rm $WORKER_PID_FILE
  else
    echo "worker PID file not found -- aborting."
  fi
}

function stop_scheduler () {
  $bin/stop-scheduler.sh
}

function stop_solr () {
  $bin/stop-solr.sh
}

function stop_webserver () {
  $bin/stop-webserver.sh
}

function stop_postgres () {
  echo "Stopping postgres..."
  $CHORUS_HOME/postgres/bin/pg_ctl -D $CHORUS_HOME/shared/db -m fast stop
}


function start () {
  if [ "$1" = "postgres" -o "$1" = "" ];   then start_postgres;    fi
  if [ "$1" = "worker" -o "$1" = "" ];     then start_worker;      fi
  if [ "$1" = "scheduler" -o "$1" = "" ];  then start_scheduler;   fi
  if [ "$1" = "solr" -o "$1" = "" ];       then start_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then start_webserver;   fi
}


function stop () {
  if [ "$1" = "worker" -o "$1" = "" ];     then stop_worker;      fi
  if [ "$1" = "scheduler" -o "$1" = "" ];  then stop_scheduler;   fi
  if [ "$1" = "solr" -o "$1" = "" ];       then stop_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then stop_webserver;   fi
  if [ "$1" = "postgres" -o "$1" = "" ];   then stop_postgres;    fi
}

if [ "$1" = "start" ]
then
  echo "starting service"
  start $2
  exit 0
elif [ "$1" = "stop" ]
then
  echo "stopping service"
  stop $2
  exit 0
elif [ "$1" = "restart" ]
then
  echo "stopping service"
  stop
  echo "starting service"
  start
  exit 0
elif [ "$1" = "monitor" ]
then
  echo "monitoring services"
  while true
  do
    start
    sleep 10
  done
else
  echo "Usage: $0 <start|stop|restart|monitor>"
fi

