#!/bin/sh
ps aux | grep 'script\/rails s' | grep -v grep | awk '{print $2}' | xargs kill -9

rails s > /dev/null 2>&1 &

if [ $? -ne 0 ]
then
    exit $?
fi
