#!/bin/bash
for file in greenplum-chorus-*.sh
do
  echo "Deploying $file"
  chmod +x $file
  rake deploy["fresh_install","$file"]
  exit $?
done
