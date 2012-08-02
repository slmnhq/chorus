#!/bin/bash

# : ${CHORUS_HOME?"Need to set CHORUS_HOME"}
# : ${RELEASE_PATH?"Need to set RELEASE_PATH"}

echo "Initializing the database..."
cd $CHORUS_HOME && ./postgres/bin/initdb --locale=en_US.UTF-8 $CHORUS_HOME/shared/db

echo "Starting db..."
cd $CHORUS_HOME && RAILS_ENV=production ./server_control.sh start postgres
sleep 1

echo "Creating user accounts..."
CHORUS_HOME=$CHORUS_HOME $RELEASE_PATH/bin/ruby packaging/bootstrap_config.rb

echo "Creating database..."
cd $RELEASE_PATH && PATH=$PATH:$CHORUS_HOME/postgres/bin RAILS_ENV=production bin/rake db:create db:migrate
echo "Database bootstrapped."
