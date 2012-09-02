#!/bin/bash
PACKAGE=$WORKSPACE/greenplum-chorus-*.sh
echo "Deploying $PACKAGE"
rake package:deploy_stage PACKAGE_FILE=$PACKAGE
