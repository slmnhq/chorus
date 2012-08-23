#!/bin/bash

. script/ci/setup.sh

rm tmp/fixture_builder.yml

bundle exec rake api_docs 2>&1