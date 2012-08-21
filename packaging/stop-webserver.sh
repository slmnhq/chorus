bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

log "stopping nginx"
cd $CHORUS_HOME/vendor/nginx/nginx_dist/
./$NGINX -s stop &>/dev/null
cd $CHORUS_HOME

case $RAILS_ENV in
    development )
        ;;
    * )
        log "stopping jetty"
        vendor/jetty/jetty-init stop &>/dev/null
        ;;
esac
