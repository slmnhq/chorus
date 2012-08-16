#!/bin/bash

. script/ci/setup.sh

rm tmp/fixture_builder.yml
bundle exec rake docs:generate