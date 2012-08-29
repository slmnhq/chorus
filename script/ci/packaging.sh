#!/bin/bash

export RAILS_ENV=packaging

. script/ci/setup.sh

export FORCE_DEPLOY=true

rm -fr .bundle
rake package:stage --trace