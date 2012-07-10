#!/bin/bash

: ${RAILS_ENV?"Need to set RAILS_ENV"}

CHORUS_HOME=.
CHORUS_LOG=$CHORUS_HOME/log
CHORUS_PID=$CHORUS_HOME/tmp/pids

function start () {
  cd $CHORUS_HOME
  mkdir -p tmp/pids

  echo "Starting worker..."
  bin/ruby script/rails runner "require 'queue_classic'; QC::Worker.new.start" > $CHORUS_LOG/queue_classic.$RAILS_ENV.log 2>&1 &
  echo $! > $CHORUS_PID/queue_classic.pid

  echo "Starting clock..."
  bin/ruby script/clock.rb > $CHORUS_LOG/clock.$RAILS_ENV.log 2>&1 &
  echo $! > $CHORUS_PID/clock.pid

  echo "Starting solr..."
  bin/rake services:solr:run > $CHORUS_LOG/solr.$RAILS_ENV.log 2>&1 &

  echo "Starting webserver..."
  vendor/jetty/jetty-init start >/dev/null 2>/dev/null &
}

function stop () {
  cd $CHORUS_HOME

  if [ -e $CHORUS_PID/queue_classic.pid ]
  then
    echo "Stopping worker..."

     # Both are necessary due to qc:work implementation
    cat $CHORUS_PID/queue_classic.pid | xargs kill
    cat $CHORUS_PID/queue_classic.pid | xargs kill

    rm $CHORUS_PID/queue_classic.pid
  else
    echo "worker PID file not found -- aborting."
  fi

  if [ -e $CHORUS_PID/clock.pid ]
  then
    echo "Stopping clock..."
    cat $CHORUS_PID/clock.pid | xargs kill
    rm $CHORUS_PID/clock.pid
  else
    echo "clock PID file not found -- aborting."
  fi

  echo "Stopping solr..."
  ps e | grep solr | grep -v grep  | cut -f1 -d' ' | xargs kill

  echo "Stopping webserver..."
  vendor/jetty/jetty-init stop
}

if [ "$1" = "start" ]
then
  echo "starting service"
  start
  exit 0
fi

if [ "$1" = "stop" ]
then
  echo "stopping service"
  stop
  exit 0
fi
