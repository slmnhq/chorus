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

##### Determine which nginx binary to use for this platform #####

unamestr=`uname`
if [[ "$unamestr" == 'Darwin' ]]; then
   NGINX=nginx_macos
else
   NGINX=nginx_linux
fi

##### support functions #####

function log () {
    echo [$RAILS_ENV] $1
}

function log_inline () {
    echo -n [$RAILS_ENV] $1
}
