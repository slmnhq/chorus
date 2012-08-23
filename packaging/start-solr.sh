#!/usr/bin/env bash
bin=`dirname "$0"`
bin=`cd "$bin"; pwd`

if [ -d $bin/current/packaging/ ]; then
    bin=$bin/current/packaging
fi

. "$bin"/chorus-config.sh

case $RAILS_ENV in
    development )
        SOLR_PORT=8982
        SOLR_LOG_LEVEL=INFO
        ;;
    test )
        SOLR_PORT=8981
        SOLR_LOG_LEVEL=WARNING
        ;;
    production )
        SOLR_PORT=8983
        SOLR_LOG_LEVEL=WARNING
        ;;
    integration )
        SOLR_PORT=8984
        SOLR_LOG_LEVEL=WARNING
        ;;
esac

DATA_DIR=$CHORUS_HOME/solr/data/$RAILS_ENV/
SOLR_LOG_FILE=$CHORUS_HOME/log/solr-$RAILS_ENV.log
LOG_CONFIG_FILE=$CHORUS_HOME/vendor/solr/logging-$RAILS_ENV.properties

if [ -f $SOLR_PID_FILE ]; then
  if kill -0 `cat $SOLR_PID_FILE` > /dev/null 2>&1; then
    log "Solr already running as process `cat $SOLR_PID_FILE`."
    exit 1
  fi
fi

echo "handlers = java.util.logging.FileHandler" > $LOG_CONFIG_FILE
echo "java.util.logging.FileHandler.level = $SOLR_LOG_LEVEL" >> $LOG_CONFIG_FILE
echo "java.util.logging.FileHandler.pattern = $SOLR_LOG_FILE" >> $LOG_CONFIG_FILE
echo "java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter" >> $LOG_CONFIG_FILE

cd $CHORUS_HOME/vendor/solr
java -Djetty.host=localhost -Djetty.port=$SOLR_PORT -Dsolr.data.dir=$DATA_DIR -Djava.util.logging.config.file=$LOG_CONFIG_FILE -jar start.jar &> /dev/null &
solr_pid=$!
echo $solr_pid > $SOLR_PID_FILE
log "Solr started as pid $solr_pid on port $SOLR_PORT"
cd $CHORUS_HOME
