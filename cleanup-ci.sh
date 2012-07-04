#!/bin/bash

if [ $# -ne 1 ]
then
    echo "Please tell me the CI script name."
    exit 1
fi

SCRIPT_NAME=$1

for file_name in `ls $WORKSPACE/tmp/pids/*$SCRIPT_NAME*`
do
    echo "Killing process id `cat $file_name`, file $file_name"
    kill -s SIGKILL `cat $file_name` > /dev/null 2&>1
done
