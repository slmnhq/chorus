##### Required environment variables CHORUS_HOME and RAILS_ENV #####

if [ "$CHORUS_HOME" = "" ]; then
    echo CHORUS_HOME not set
    exit 1
fi
test "$RAILS_ENV" = "" && RAILS_ENV=production

case $RAILS_ENV in
    production )
        RUBY=bin/ruby
        ;;
    * )
        RUBY=ruby
        ;;
esac

##### PID file locations #####

mkdir -p $CHORUS_HOME/tmp/pids
SOLR_PID_FILE=$CHORUS_HOME/tmp/pids/solr-$RAILS_ENV.pid
NGINX_PID_FILE=$CHORUS_HOME/vendor/nginx/nginx_dist/nginx_data/logs/nginx.pid
JETTY_PID_FILE=$CHORUS_HOME/vendor/jetty/run/jetty.pid
SCHEDULER_PID_FILE=$CHORUS_HOME/tmp/pids/scheduler.$RAILS_ENV.pid
WORKER_PID_FILE=$CHORUS_HOME/tmp/pids/worker.$RAILS_ENV.pid
MIZUNO_PID_FILE=$CHORUS_HOME/tmp/pids/mizuno.pid

POSTGRES_DIR=$CHORUS_HOME/postgres-db
POSTGRES_PID_FILE=$POSTGRES_DIR/postmaster.pid

##### Determine which nginx binary to use for this platform #####

unamestr=`uname`
if [[ "$unamestr" == 'Darwin' ]]; then
   NGINX=nginx_macos
else
   NGINX=nginx_linux
fi

##### support functions #####

function log () {
    echo "[$RAILS_ENV] $1"
}

function log_inline () {
    echo -n "[$RAILS_ENV] $1"
}

function depends_on () {
    missing_dependencies=()
    dependency_num=1
    until [ -z "$1" ]  # Until all parameters used up . . .
    do
        pid_file=`echo $1 | tr '[:lower:]' '[:upper:]'`_PID_FILE
        if [ ! -f ${!pid_file} ]; then
            missing_dependencies[$dependency_num]=$1
            dependency_num=$(($dependency_num + 1))
        fi
        shift
    done

    if [ ${#missing_dependencies[@]} -ne 0 ]; then
        joiner=""
        message=""
        for missing_dependency in ${missing_dependencies[*]}
        do
            message=$message$joiner$missing_dependency
            joiner=", "
        done
        log "$message must be running to start the $STARTING"
        exit 1
    fi
}

function wait_for_start () {
    pid_file=$1
    until ( test -f $pid_file ) && ( kill -0 `head -1 $pid_file` > /dev/null 2>&1 )
    do
        sleep 1
    done
}

function wait_for_stop () {
    pid_file=$1
    while kill -0 `head -1 $pid_file 2>/dev/null` > /dev/null 2>&1
    do
        echo -n "."
        sleep 5
    done
    echo " ( Stopped )"
}