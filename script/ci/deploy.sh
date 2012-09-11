#!/bin/bash
for file in greenplum-chorus-*.sh
do
  echo "Deploying $file"
  chmod +x $file
  rake deploy["stage","$file"]
  exit $?
done
