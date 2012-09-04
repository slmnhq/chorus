#!/usr/bin/env bash
bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
bin=`cd "$bin"; pwd`

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
        JETTY_PID=$JETTY_PID_FILE RAILS_ENV=$RAILS_ENV ./jetty-init stop
        cd $CHORUS_HOME
        wait_for_stop $JETTY_PID_FILE
        ;;
esac
