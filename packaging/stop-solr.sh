bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

if [ -f $SOLR_PID_FILE ]; then
  if kill -0 `cat $SOLR_PID_FILE` > /dev/null 2>&1; then
    log "stopping solr"
    kill `cat $SOLR_PID_FILE` && rm $SOLR_PID_FILE
  else
    log "Could not stop solr. Check that process `cat $SOLR_PID_FILE` exists"
    exit 1
  fi
else
  log "no solr to stop"
fi
