# chorus-config.sh is responsible for setting RAILS_ENV and CHORUS_HOME

if [ "$CHORUS_HOME" = "" ]; then
    echo CHORUS_HOME not set
    exit 1
fi
test "$RAILS_ENV" = "" && RAILS_ENV=production

SOLR_PID_FILE=$CHORUS_HOME/tmp/pids/solr-$RAILS_ENV.pid