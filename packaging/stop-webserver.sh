#!/usr/bin/env bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

if [ -d $bin/current/packaging/ ]; then
    bin=$bin/current/packaging
fi

. "$bin"/chorus-config.sh

log_inline "stopping nginx "
cd $CHORUS_HOME/vendor/nginx/nginx_dist/
./$NGINX -s stop
wait_for_stop $NGINX_PID_FILE
cd $CHORUS_HOME

case $RAILS_ENV in
    development )
        log_inline "stopping mizuno "
        mizuno --stop --pidfile $MIZUNO_PID_FILE &>/dev/null
        wait_for_stop $MIZUNO_PID_FILE
        ;;
    * )
        log_inline "stopping jetty "
        cd $CHORUS_HOME/vendor/jetty/
        JETTY_PID=$JETTY_PID_FILE ./jetty-init stop
        cd $CHORUS_HOME
        wait_for_stop $JETTY_PID_FILE
        ;;
esac
