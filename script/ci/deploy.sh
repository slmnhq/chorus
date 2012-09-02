#!/bin/bash
for file in greenplum-chorus-*.sh
do
  echo "Deploying $file"
  chmod +x $file
  rake package:deploy_stage PACKAGE_FILE=$file
  exit $?
done
