#!/usr/bin/env bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

command=$1
shift

services=(${@})

function contains() {
    local n=$#
    local value=${!n}
    for ((i=1;i < $#;i++)) {
        if [ "${!i}" == "${value}" ]; then
            return 0
        fi
    }
    return 1
}

function no_services() {
  if [ ${#services[@]} -eq 0 ]; then
    return 0
  else
    return 1
  fi
}

function should_handle () {
  # If no services are provided, or $1 is one of the services to start
  if no_services || contains ${services[@]} $1; then
    return 0
  else
    return 1
  fi
}

function start () {
  pushd $CHORUS_HOME > /dev/null
  if should_handle postgres;  then $bin/start-postgres.sh;    fi
  if should_handle workers;   then $bin/start-workers.sh;     fi
  if should_handle scheduler; then $bin/start-scheduler.sh;   fi
  if should_handle solr;      then $bin/start-solr.sh;        fi
  if should_handle webserver; then $bin/start-webserver.sh;   fi
  popd > /dev/null
}

function stop () {
  pushd $CHORUS_HOME > /dev/null
  if should_handle webserver;  then $bin/stop-webserver.sh;   fi
  if should_handle solr;       then $bin/stop-solr.sh;        fi
  if should_handle scheduler;  then $bin/stop-scheduler.sh;   fi
  if should_handle workers;    then $bin/stop-workers.sh;     fi
  if should_handle postgres;   then $bin/stop-postgres.sh;    fi
  popd > /dev/null
}

function usage () {
  script=`basename $0`
  echo "$script is a utility to start, stop, or restart the Chorus services."
  echo
  echo Usage:
  echo "  $script start   [services]         start services"
  echo "  $script stop    [services]         stop services"
  echo "  $script restart [services]         stop and start services"
  echo
  echo "The following services are available: postgres, workers, scheduler, solr, webserver."
  echo "If no services are specified on the command line, $script manages all services."
  echo
  echo Examples:
  echo "  $script start                      start all services"
  echo "  $script stop                       stop all services"
  echo "  $script restart                    restart all services"
  echo
  echo "  $script start postgres solr        start specific services"
  echo "  $script stop scheduler workers     stop specific services"
  echo "  $script restart webserver          restart specific services"
  echo
}

case $command in
    start )
        start $services
        ;;
    stop )
        stop
        ;;
    restart )
        stop $services
        start $services
        ;;
    * )
        usage
        ;;
esac

# --- Delete me ---
#if [(( ${#services[@]} == 0 || contains ${services[@]} $1 ))]; then
#echo ${#services[@]} services in should_handle
#if [ ${#services[@]} -eq 0 ]; then
#if no_services; then

#should_handle baz
# Delete me
#exit

#if [ should_handle baz ]; then
#    echo Hello
#fi

#if [ "$1" = "scheduler" -o "$1" = "" ];  then $bin/stop-scheduler.sh;   fi
  #if [ "$1" = "workers" -o "$1" = "" ];    then $bin/stop-workers.sh;     fi
  #if [ "$1" = "solr" -o "$1" = "" ];       then $bin/stop-solr.sh;        fi
  #if [ "$1" = "webserver" -o "$1" = "" ];  then $bin/stop-webserver.sh;   fi
  #if [ "$1" = "postgres" -o "$1" = "" ];   then $bin/stop-postgres.sh;    fi

#if no_services; then
#  echo No services exist!
#fi
