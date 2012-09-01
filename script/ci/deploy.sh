#!/bin/bash
PACKAGE=$WORKSPACE/greenplum_chorus-*.sh
rake package:deploy_stage PACKAGE_FILE=$PACKAGE
