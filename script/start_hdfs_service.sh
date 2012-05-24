#!/bin/bash

if [ ! -f ./vendor/hadoop/hdfs-query-service-0.0.1.jar ];
then
    echo "Please install hdfs query service using script/install_hdfs_query.sh"
    exit 1
fi

java -Ddw.http.port=5000 -jar vendor/hadoop/hdfs-query-service-0.0.1.jar server config/hdfs_service.yml