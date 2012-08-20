bin=`dirname "$0"`
bin=`cd "$bin"; pwd`
. "$bin"/chorus-config.sh

if [ -f $SOLR_PID_FILE ]; then
  if kill -0 `cat $SOLR_PID_FILE` > /dev/null 2>&1; then
    echo [$RAILS_ENV] stopping solr
    kill `cat $SOLR_PID_FILE` && rm $SOLR_PID_FILE
  else
    echo [$RAILS_ENV] Could not stop solr. Check that process `cat $SOLR_PID_FILE` exists
    exit 1
  fi
else
  echo [$RAILS_ENV] no solr to stop
fi
