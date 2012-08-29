#!/bin/bash

export RAILS_ENV=test

. script/ci/setup.sh

bundle exec rake api_docs 2>&1
