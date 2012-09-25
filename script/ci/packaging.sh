#!/bin/bash

export RAILS_ENV=packaging
GPDB_HOST=chorus-gpdb42

. script/ci/setup.sh

rm -fr .bundle
GPDB_HOST=$GPDB_HOST bundle exec rake package:installer --trace
