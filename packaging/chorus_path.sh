#!/bin/sh

bin=`readlink "$0"`
if [ "$bin" == "" ]; then
 bin=$0
fi
bin=`dirname "$bin"`
export CHORUS_HOME=`cd $bin; pwd`
export PATH=$PATH:$CHORUS_HOME