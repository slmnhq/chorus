#!/bin/bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

function start_postgres () {
  $bin/start-postgres.sh
}

function start_workers () {
  $bin/start-workers.sh
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

function stop_workers () {
  $bin/stop-workers.sh
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
  $bin/stop-postgres.sh
}


function start () {
  if [ "$1" = "postgres" -o "$1" = "" ];   then start_postgres;    fi
  if [ "$1" = "workers" -o "$1" = "" ];    then start_workers;     fi
  if [ "$1" = "scheduler" -o "$1" = "" ];  then start_scheduler;   fi
  if [ "$1" = "solr" -o "$1" = "" ];       then start_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then start_webserver;   fi
}


function stop () {
  if [ "$1" = "scheduler" -o "$1" = "" ];  then stop_scheduler;   fi
  if [ "$1" = "workers" -o "$1" = "" ];    then stop_workers;     fi
  if [ "$1" = "solr" -o "$1" = "" ];       then stop_solr;        fi
  if [ "$1" = "webserver" -o "$1" = "" ];  then stop_webserver;   fi
  if [ "$1" = "postgres" -o "$1" = "" ];   then stop_postgres;    fi
}

if [ "$1" = "start" ]
then
  start $2
  exit 0
elif [ "$1" = "stop" ]
then
  stop $2
  exit 0
elif [ "$1" = "restart" ]
then
  stop
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

