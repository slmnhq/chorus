#!/bin/bash

# WARNING: We assume that git and gcc are installed

function resolve_path {
    GLOBAL_NEW_DIR="$( cd "$1" && pwd )"
}


SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

resolve_path "$SCRIPT_DIR/.."
DIR=$GLOBAL_NEW_DIR

DATE="$( date "+%Y-%m-%d-%H%M%S" )"

PACKAGE_NAME="chorusrails-packages"
resolve_path "$DIR/../$PACKAGE_NAME"
PACKAGE_DIR="$GLOBAL_NEW_DIR"


# Gems
bundle package

# Tar up the app
if [ -d "$PACKAGE_DIR" ]; then 
    echo "Directory exists: $PACKAGE_DIR";
else
    mkdir "$PACKAGE_DIR";
fi

resolve_path "$DIR/../chorusrails"
tar -cf "$PACKAGE_DIR/app.tar" "$GLOBAL_NEW_DIR"

# Download and tar up ruby and rbenv

RUBY_URL="http://ftp.ruby-lang.org/pub/ruby/1.9/ruby-1.9.3-p125.tar.gz"
RUBY_SRC="ruby-src.tar.gz"

if [ -a "$PACKAGE_DIR/$RUBY_SRC" ]; then 
    echo "Ruby exists: $PACKAGE_DIR/$RUBY_SRC";
else
    curl "$RUBY_URL" >> "$RUBY_SRC"
    mv "$RUBY_SRC" "$PACKAGE_DIR"
fi

if [ -d "$PACKAGE_DIR/rbenv" ]; then 
    echo "Directory exists: $PACKAGE_DIR/rbenv";
else
    git clone git://github.com/sstephenson/rbenv.git "$PACKAGE_DIR/rbenv"
fi

# Download and tar up Postgres

# Download and tar up imagemagick

# Tar up vendor jars

# Tar up everything into a huge bundle

tar -cf $PACKAGE_DIR/chorus-rails-$DATE.tar $PACKAGE_DIR/rbenv $PACKAGE_DIR/app.tar $PACKAGE_DIR/$RUBY_SRC
#rm -rf $PACKAGE_DIR/rbenv $PACKAGE_DIR/app.tar $PACKAGE_DIR/$RUBY_SRC

