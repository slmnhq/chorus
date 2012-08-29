#!/bin/bash

export RAILS_ENV=test

. script/ci/setup.sh

export FORCE_DEPLOY=true

rm -fr .bundle
rake package:stage --trace
