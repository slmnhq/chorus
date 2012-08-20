#!/bin/bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

test "$RAILS_ENV" = "" && RAILS_ENV=production

POSTGRES_PORT=8543
SOLR_ATTEMPTS=200

STARTING_DIR=$(pwd)
SCRIPT_DIR=$(dirname $0)
cd $STARTING_DIR/$SCRIPT_DIR

RAILS_ENV=$RAILS_ENV

CHORUS_LOG=$CHORUS_HOME/log
CHORUS_PID=$CHORUS_HOME/tmp/pids
mkdir -p $CHORUS_PID
CHORUS_NGINX=$CHORUS_HOME/nginx_dist


CLOCK_PID_FILE=$CHORUS_PID/clock.$RAILS_ENV.pid
WORKER_PID_FILE=$CHORUS_PID/queue_classic.$RAILS_ENV.pid
NGINX_PID_FILE=$CHORUS_NGINX/nginx_data/logs/nginx.pid


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

function start_clock () {
  test ! -e $CHORUS_PID && echo "PID FOLDER DOES NOT EXIST!! Skipping ..." && return 1

  pid_is_running "$(cat $CLOCK_PID_FILE 2> /dev/null)"
  clock_pid_present=$?

  # Remember that 1 is FALSE in bash!
  if [ $clock_pid_present -eq 1 ]
  then
    echo "Starting clock..."
    cd $CHORUS_HOME
      bin/ruby script/clock.rb > $CHORUS_LOG/clock.$RAILS_ENV.log 2>&1 &
      echo $! > $CLOCK_PID_FILE
  else
    echo "Clock is still running..."
  fi
}

function start_nginx () {
  test ! -e $CHORUS_NGINX && echo "nginx not found, skipping." && return 0

  cd $CHORUS_HOME
  bin/ruby packaging/generate_nginx_conf.rb

  cd $CHORUS_NGINX

  pid_is_running "$(cat $NGINX_PID_FILE 2> /dev/null)"
  nginx_pid_present=$?

  if [ $nginx_pid_present -eq 1 ]
  then
    if [ -e ./nginx_data/logs/nginx.pid ]
    then
      echo "nginx already running, reloading config"
      ./nginx -s reload
    else
      echo "starting nginx..."
      ./nginx
    fi
  else
    echo "nginx is still running..."
  fi
}

function start_solr () {
  $bin/start-solr.sh
}

function start_webserver () {
  ps x | grep vendor/jetty/start.jar | grep -v grep > /dev/null
  jetty_pid_present=$?

  if [ $jetty_pid_present -eq 1 ]
  then
    echo "Starting webserver..."
    cd $CHORUS_HOME
    vendor/jetty/jetty-init start >/dev/null 2>/dev/null &
  else
    echo "Webserver is still running..."
  fi
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

function stop_clock () {
  cd $CHORUS_HOME

  if [ -e $CLOCK_PID_FILE ]
  then
    echo "Stopping clock..."
    cat $CLOCK_PID_FILE | xargs kill
    rm $CLOCK_PID_FILE
  else
    echo "clock PID file not found -- aborting."
  fi
}

function stop_solr () {
  $bin/stop-solr.sh
}

function stop_webserver () {
  echo "Stopping webserver..."
  $CHORUS_HOME/vendor/jetty/jetty-init stop
}

function stop_nginx () {
  echo "Stopping nginx..."
  cd $CHORUS_NGINX
  ./nginx -s stop
}

function stop_postgres () {
  echo "Stopping postgres..."
  $CHORUS_HOME/postgres/bin/pg_ctl -D $CHORUS_HOME/shared/db -m fast stop
}


function start () {
  if [ "$1" = "postgres" -o "$1" = "" ];   then start_postgres;    fi
  if [ "$1" = "worker" -o "$1" = "" ];     then start_worker;      fi
  if [ "$1" = "clock" -o "$1" = "" ];      then start_clock;       fi
  if [ "$1" = "solr" -o "$1" = "" ];       then start_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then start_webserver;   fi
  if [ "$1" = "nginx" -o "$1" = "" ];      then start_nginx;       fi
}


function stop () {
  if [ "$1" = "worker" -o "$1" = "" ];     then stop_worker;      fi
  if [ "$1" = "clock" -o "$1" = "" ];      then stop_clock;       fi
  if [ "$1" = "solr" -o "$1" = "" ];       then stop_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then stop_webserver;   fi
  if [ "$1" = "nginx" -o "$1" = "" ];      then stop_nginx;       fi
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

