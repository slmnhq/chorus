#!/bin/bash

rm $WORKSPACE/log/*

for file_name in `ls "$WORKSPACE/tmp/pids/*$RAILS_ENV*"`
do
    echo "Killing process id `cat '$file_name'`, file '$file_name'"
    kill -s SIGKILL `cat "$file_name"` 2>&1
done

exit 0
