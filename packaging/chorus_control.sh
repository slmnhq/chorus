#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
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

function should_handle () {
  # If no services are provided, or $1 is a service to start
  [ ${#services[@]} -eq 0 ] || contains ${services[@]} $1
}

function start () {
  EXIT_STATUS=0
  pushd $CHORUS_HOME > /dev/null
  if should_handle postgres;  then
    $bin/start-postgres.sh;
    EXIT_STATUS=`expr $EXIT_STATUS + $?`;
  fi
  if should_handle workers;   then
    $bin/start-workers.sh;
    EXIT_STATUS=`expr $EXIT_STATUS + $?`;
  fi
  if should_handle scheduler; then
    $bin/start-scheduler.sh;
    EXIT_STATUS=`expr $EXIT_STATUS + $?`;
  fi
  if should_handle solr;      then
    $bin/start-solr.sh;
    EXIT_STATUS=`expr $EXIT_STATUS + $?`;
  fi
  if should_handle webserver; then
    $bin/start-webserver.sh;
    EXIT_STATUS=`expr $EXIT_STATUS + $?`;
  fi
  popd > /dev/null
  if (($EXIT_STATUS > 0)); then
    exit $EXIT_STATUS;
  fi
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

function monitor () {
  echo "Monitoring services..."
  echo
  while true
  do
    start
    sleep 10
    echo
  done
}

function backup () {
  while getopts "d:r:" OPTION
  do
       case $OPTION in
           d)
               BACKUP_DIR=$OPTARG
               ;;
           r)
               ROLLING_DAYS=$OPTARG
               ;;
           ?)
               usage
               exit
               ;;
       esac
  done

  if [ -z "$BACKUP_DIR" ]; then
     read -p "Please enter the destination directory for your backup: " BACKUP_DIR
  fi

  echo "Backing up chorus data..."
  run_in_root_dir_with_postgres "rake backup:create[$BACKUP_DIR,$ROLLING_DAYS]"
}

function restore () {

  BACKUP_FILENAME=${@}
  while true; do
      if [ -z "$BACKUP_FILENAME" ]; then
          read -p "Please enter the name of a backup file to restore: " BACKUP_FILENAME
      else
          if [ -r "$BACKUP_FILENAME" ] && [ -f "$BACKUP_FILENAME" ]; then
              break;
          fi
          read -p "File \"$BACKUP_FILENAME\" does not exist or could not be read.  Please enter a different file: " BACKUP_FILENAME
      fi
  done

  BACKUP_DIR=`dirname $BACKUP_FILENAME`
  BACKUP_ABSOLUTE_DIR=`cd $BACKUP_DIR && echo $PWD`
  BACKUP_ABSOLUTE_FILENAME="$BACKUP_ABSOLUTE_DIR/"`basename $BACKUP_FILENAME`

  echo "Restoring chorus data..."
  run_in_root_dir_with_postgres "rake backup:restore[$BACKUP_ABSOLUTE_FILENAME] --trace"
}

function run_in_root_dir_with_postgres () {
  pushd $CHORUS_HOME > /dev/null

  if ! kill -0 `head -1 $POSTGRES_PID_FILE 2>&1` >& /dev/null; then
      postgres_started="1"
      $bin/start-postgres.sh
  fi

  ${@}

  if [ -n "$postgres_started" ]; then
      $bin/stop-postgres.sh
  fi

  popd > /dev/null
}

function usage () {
  script=`basename $0`
  echo "$script is a utility to start, stop, restart, or monitor the Chorus services."
  echo
  echo Usage:
  echo "  $script start   [services]         start services"
  echo "  $script stop    [services]         stop services"
  echo "  $script restart [services]         stop and start services"
  echo "  $script monitor [services]         monitor and restart services as needed"
  echo "  $script backup  [-d dir] [-r days] backup Chorus data"
  echo "  $script restore [file]             restore Chorus data"
  echo
  echo "The following services are available: postgres, workers, scheduler, solr, webserver."
  echo "If no services are specified on the command line, $script manages all services."
  echo
  echo Examples:
  echo "  $script start                      start all services"
  echo "  $script stop                       stop all services"
  echo "  $script restart                    restart all services"
  echo "  $script monitor                    monitor all services"
  echo
  echo "  $script start postgres solr        start specific services"
  echo "  $script stop scheduler workers     stop specific services"
  echo "  $script restart webserver          restart specific services"
  echo "  $script monitor workers            monitor specific services"
  echo
  echo "  $script backup -d backup_dir       backup Chorus data"
  echo "  $script restore backup_filename    restore Chorus data"
  echo

  return 1
}


case $command in
    start )
        start
        ;;
    stop )
        stop
        ;;
    restart )
        stop
        start
        ;;
    monitor )
       monitor
       ;;
    backup )
       backup ${@}
       ;;
    restore )
       restore ${@}
       ;;
    * )
       usage
       ;;
esac
