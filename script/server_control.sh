#!/bin/bash

: ${RAILS_ENV?"Need to set RAILS_ENV"}

CHORUS_HOME=.
CHORUS_LOG=$CHORUS_HOME/log
CHORUS_PID=$CHORUS_HOME/tmp/pids

SOLR_ATTEMPTS=200

CLOCK_PID_FILE=$CHORUS_PID/clock.$RAILS_ENV.pid
WORKER_PID_FILE=$CHORUS_PID/queue_classic.$RAILS_ENV.pid

function start_worker () {
  echo "Starting worker..."
  bin/ruby script/rails runner "require 'queue_classic'; QC::Worker.new.start" > $CHORUS_LOG/queue_classic.$RAILS_ENV.log 2>&1 &
  echo $! > $WORKER_PID_FILE
}

function start_clock () {
  echo "Starting clock..."
  bin/ruby script/clock.rb > $CHORUS_LOG/clock.$RAILS_ENV.log 2>&1 &
  echo $! > $CLOCK_PID_FILE
}

function start_solr () {
  echo "Starting solr..."
  bin/rake services:solr:run > $CHORUS_LOG/solr.$RAILS_ENV.log 2>&1 &

  ps e | grep "solr.*start" | grep -v grep > /dev/null
  child_solr_pid=$?
  attempts=0

  while [ $child_solr_pid -eq 1 -a $attempts -lt $SOLR_ATTEMPTS ]
  do
    sleep 1
    ps e | grep "solr.*start.jar" | grep -v grep > /dev/null
    child_solr_pid=$?
    let "attempts += 1"
  done

  test $attempts -ge $SOLR_ATTEMPTS && echo "WARNING: Solr didn't start in approx. $SOLR_ATTEMPTS seconds."
}

function start_webserver () {
  echo "Starting webserver..."
  vendor/jetty/jetty-init start >/dev/null 2>/dev/null &
}

function start () {
  cd $CHORUS_HOME
  mkdir -p $CHORUS_PID

  start_worker
  start_clock
  start_solr
  start_webserver
}

function stop () {
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

  if [ -e $CLOCK_PID_FILE ]
  then
    echo "Stopping clock..."
    cat $CLOCK_PID_FILE | xargs kill
    rm $CLOCK_PID_FILE
  else
    echo "clock PID file not found -- aborting."
  fi

  echo "Stopping solr..."
  ps e | grep solr | grep -v grep | awk '{print $1}' | xargs kill

  echo "Stopping webserver..."
  vendor/jetty/jetty-init stop
}

function pid_is_running () {
  test -z "$1" && return 1;

  ps x | grep "^\s*$1\b" > /dev/null
  return $?
}

function monitor () {
  pid_is_running "$(cat $WORKER_PID_FILE 2> /dev/null)"
  worker_pid_present=$?

  # Remember that 1 is FALSE in bash!
  if [ $worker_pid_present -eq 1 ]
  then
    echo "Worker is not running, restarting..."
    start_worker
  else 
    echo "Worker is still running..."
  fi

  pid_is_running "$(cat $CLOCK_PID_FILE 2> /dev/null)"
  clock_pid_present=$?

  # Remember that 1 is FALSE in bash!
  if [ $clock_pid_present -eq 1 ]
  then
    echo "Clock is not running, restarting..."
    start_clock
  else 
    echo "Clock is still running..."
  fi

  ps x | grep "solr.*start" | grep -v grep > /dev/null
  solr_pid_present=$?

  if [ $solr_pid_present -eq 1 ]
  then
    echo "Solr is not running, restarting..."
    start_solr
  else
    echo "Solr is still running..."
  fi

  ps x | grep vendor/jetty/start.jar | grep -v grep > /dev/null
  jetty_pid_present=$?

  if [ $jetty_pid_present -eq 1 ]
  then
    echo "Jetty is not running, restarting..."
    start_webserver
  else
    echo "Jetty is still running..."
  fi
}

if [ "$1" = "start" ]
then
  echo "starting service"
  monitor
  exit 0
elif [ "$1" = "stop" ]
then
  echo "stopping service"
  stop
  exit 0
elif [ "$1" = "monitor" ]
then
  echo "monitoring services"
  while true
  do
    monitor
    sleep 10
  done
else
  echo "Usage: $0 <start|stop|monitor>"
fi

