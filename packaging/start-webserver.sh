#!/usr/bin/env bash

bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

# start nginx and the application server
# in development, start mizuno in foreground
# in production, start jetty in background

# depends on solr, workers, postgres

if [ ! -f $SOLR_PID_FILE ]; then
    log "Solr must be running to start the web server."
    exit 1
fi

log "Writing nginx config..."
$RUBY vendor/nginx/generate_nginx_conf.rb

cd $CHORUS_HOME/vendor/nginx/nginx_dist/
if [ -f $NGINX_PID_FILE ]; then
    if kill -0 `cat $NGINX_PID_FILE` > /dev/null 2>&1; then
        log "nginx already running as process `cat $NGINX_PID_FILE`. Reloading config..."
        ./$NGINX -s reload
    else
        ./$NGINX
        log "nginx started as pid `cat $NGINX_PID_FILE`"
    fi
else
    ./$NGINX
    log "nginx started as pid `cat $NGINX_PID_FILE`"
fi

cd $CHORUS_HOME

case $RAILS_ENV in
    development )
        log "starting mizuno on port 8081..."
        bundle exec mizuno -p 8081 --threads 10
        ;;
    * )
        log "starting jetty..."
        vendor/jetty/jetty-init start &>/dev/null &
        ;;
esac
