#!/bin/bash

RUBY_URL="http://ftp.ruby-lang.org/pub/ruby/1.9/ruby-1.9.3-p125.tar.gz"
#RBENV_URL="git://github.com/sstephenson/rbenv.git"

HADOOP_URL1="http://www.reverse.net/pub/apache/hadoop/common/hadoop-1.0.0/hadoop-1.0.0.tar.gz"
HADOOP_URL2="http://apache.spinellicreations.com/hadoop/common/hadoop-0.20.205.0/hadoop-0.20.205.0.tar.gz"
HADOOP_URL3="http://archive.apache.org/dist/hadoop/core/hadoop-0.20.1/hadoop-0.20.1.tar.gz"

POSTGRES_URL="http://ftp.postgresql.org/pub/source/v9.0.4/postgresql-9.0.4.tar.gz"
IMAGEMAGICK_URL="http://www.imagemagick.org/download/legacy/ImageMagick-6.7.1-10.tar.gz"

BUNDLER_URL="http://rubygems.org/downloads/bundler-1.1.3.gem"
RUBYGEMS_URL="http://production.cf.rubygems.org/rubygems/rubygems-1.8.24.tgz"

# WARNING: We assume that git and gcc are installed

####################################################################
####################################################################

function resolve_path {
    RESOLVED_PATH="$( cd "$1" && pwd )"
}

# $1: url
# $2: local filename
# $3: target path
function download {
    if [ -a "$3/$2" ]; then 
        echo "Download exists: $2"
    else
        echo "Downloading $2 from $1"
        curl "$1" >> "$2"
        mv "$2" "$3"
    fi
}

# $1: url
# $2: local folder name
# $3: target path
function git_clone {
    if [ -d "$3/$2" ]; then 
        echo "Directory exists: $3/$2"
    else
        git clone $1 "$3/$2"
    fi
}

####################################################################
####################################################################

# Paths
TARGET_DIR="downloads"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

resolve_path "$SCRIPT_DIR/.."
TEMP_DIR=$RESOLVED_PATH

PACKAGE_NAME="chorusrails-packages"
mkdir -p "$TEMP_DIR/../$PACKAGE_NAME"
resolve_path "$TEMP_DIR/../$PACKAGE_NAME"

PACKAGE_DIR="$RESOLVED_PATH"

HADOOP_DIR="$PACKAGE_DIR/$TARGET_DIR/hadoop"
mkdir -p "$HADOOP_DIR"

DATE="$( date "+%Y-%m-%d-%H%M%S" )"

####################################################################
####################################################################

# Gems
echo "Running bundle package..."
bundle package > /dev/null 2>&1

rake assets:precompile

# also need to add rubygems and the bundler gem to the package
download $RUBYGEMS_URL "rubygems-1.8.24.tgz" "$PACKAGE_DIR/$TARGET_DIR"
gem fetch bundler -v 1.1.3
mv bundler-1.1.3.gem "$PACKAGE_DIR/$TARGET_DIR"

# Tar up the app
mkdir -p $PACKAGE_DIR/$TARGET_DIR

EXCLUDE_FROM_APP="--exclude vendor/hadoop --exclude var --exclude tmp --exclude .git --exclude public/system --exclude log"

resolve_path "$TEMP_DIR/../chorusrails"
cd "$TEMP_DIR/.."
tar -cf "$PACKAGE_DIR/$TARGET_DIR/app.tar" $EXCLUDE_FROM_APP chorusrails

# Download ruby and rbenv
RUBY_SRC="ruby-src.tar.gz"
download $RUBY_URL $RUBY_SRC "$PACKAGE_DIR/$TARGET_DIR"
#git_clone $RBENV_URL "rbenv" "$PACKAGE_DIR/$TARGET_DIR"

# Download Postgres
POSTGRES_SRC="postgresql-9.0.4.tar.gz"
download $POSTGRES_URL $POSTGRES_SRC "$PACKAGE_DIR/$TARGET_DIR"

# Download imagemagick
download $IMAGEMAGICK_URL "ImageMagick-6.7.1-10.tar.gz" "$PACKAGE_DIR/$TARGET_DIR"

# Download Hadoop vendor jars
download $HADOOP_URL1 "hadoop-1.0.0.tar.gz" $HADOOP_DIR
download $HADOOP_URL2 "hadoop-0.20.205.0.tar.gz" $HADOOP_DIR
download $HADOOP_URL3 "hadoop-0.20.1.tar.gz" $HADOOP_DIR

# Tar up everything into a huge bundle
TARGET_NAME="$PACKAGE_DIR/chorus-rails-$DATE.tar"
echo "Creating target package: $TARGET_NAME"
cd "$PACKAGE_DIR"
tar -cf $TARGET_NAME "$TARGET_DIR"
rm $PACKAGE_DIR/$TARGET_DIR/app.tar

# Clean up the precompiled assets in our app directory
cd "$SCRIPT_DIR"
rake assets:clean