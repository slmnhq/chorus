#!/bin/bash

. script/ci/setup.sh

export FORCE_DEPLOY=true

rake package:stage --trace