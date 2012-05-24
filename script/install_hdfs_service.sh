#!/bin/bash

# Clean up old hadoop installations
echo "Removing old installations of hadoop..."
mkdir -p vendor/hadoop
rm -rf vendor/hadoop/*

# Clone the chorus HDFS service project
echo "Cloning chorus HDFS service..."
pushd vendor/hadoop
git clone git@github.com:GreenplumChorus/chorushdfs.git

# Build the project and install id on vendor/hadoop
pushd chorushdfs
echo "Building project..."
mvn clean package
cp hdfs-query-service/target/hdfs-query-service*jar ../
popd

rm -rf chorushdfs
popd

echo "Done."