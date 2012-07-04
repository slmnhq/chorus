#!/bin/bash

for file_name in `ls $WORKSPACE/tmp/pids/*$RAILS_ENV*`
do
    echo "Killing process id `cat $file_name`, file $file_name"
    kill -s SIGKILL `cat $file_name` > /dev/null 2&>1
done
