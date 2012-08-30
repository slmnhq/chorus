#!/bin/bash

export RAILS_ENV=test

. script/ci/setup.sh

export FORCE_DEPLOY=true

rm -fr .bundle
rake package:stage --trace

exit_status=$?   #start up gpfdist, but don't pollute the exit status

export LD_LIBRARY_PATH=vendor/gpfdist-rhel5/lib:${LD_LIBRARY_PATH}
./vendor/gpfdist-rhel5/bin/gpfdist -p 8180 -d /tmp &
./vendor/gpfdist-rhel5/bin/gpfdist -p 8181 -d /tmp &

exit $exit_status
