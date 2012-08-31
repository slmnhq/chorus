#!/bin/bash

export RAILS_ENV=test

. script/ci/setup.sh

rm -fr .bundle
rake package:stage --trace