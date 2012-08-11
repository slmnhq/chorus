#!/bin/bash

. script/ci/setup.sh

export FORCE_DEPLOY=true

RAILS_ENV=integration rake package:stage package:installer --trace