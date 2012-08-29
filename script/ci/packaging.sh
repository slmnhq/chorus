#!/bin/bash

. script/ci/setup.sh

export FORCE_DEPLOY=true

rm -fr .bundle
rake package:stage --trace