#!/bin/sh

./script/start_db.sh
if [ $? -ne 0 ]
then
    exit $?
fi

./script/start_rails.sh
if [ $? -ne 0 ]
then
    exit $?
fi
