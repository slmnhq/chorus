#!/bin/bash

export RAILS_ENV=packaging

. script/ci/setup.sh

rm -fr .bundle
rake package:installer --trace
