#!/bin/bash

. script/ci/setup.sh

rm tmp/fixture_builder.yml
status=`bundle exec rake api_docs`
echo "$status"

if [[ "$status" == *"Missing docs"* ]]
then
    exit 254
fi
