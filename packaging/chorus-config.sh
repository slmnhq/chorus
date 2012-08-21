##### Required environment variables CHORUS_HOME and RAILS_ENV #####

if [ "$CHORUS_HOME" = "" ]; then
    echo CHORUS_HOME not set
    exit 1
fi
test "$RAILS_ENV" = "" && RAILS_ENV=production
echo Running in $RAILS_ENV mode...

case $RAILS_ENV in
    production )
        RUBY=bin/ruby
        ;;
    * )
        RUBY=ruby
        ;;
esac

##### PID file locations #####

SOLR_PID_FILE=$CHORUS_HOME/tmp/pids/solr-$RAILS_ENV.pid
NGINX_PID_FILE=$CHORUS_HOME/packaging/nginx_dist/nginx_data/logs/nginx.pid


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
