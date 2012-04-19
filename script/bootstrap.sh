#!/bin/bash

ruby_version="1.9.3-p125"

install_ruby_build() {
  plugins_dir=$HOME/.rbenv/plugins
  if [ ! -e $plugins_dir/ruby-build ]
  then
    (
      mkdir -p $plugins_dir
      cd $plugins_dir
      git clone git://github.com/sstephenson/ruby-build.git
    )
  fi
}

install_ruby_for_chorus() {
  echo "***** installing ruby"
  export CC=/usr/bin/gcc
  rbenv install $ruby_version || true
  rbenv rehash || true
}

install_bundler_for_chorus() {
  echo "***** installing bundler"
  gem install bundler
  rbenv rehash || true
}

add_rbenv_to_bash() {
    rbenv_config="$HOME/.bash_profile_includes/rbenv.sh"
    if [ ! -e "$rbenv_config" ]
    then
      cp script/rbenv.sh $rbenv_config
      echo "***** Added rbenv init to bash profile includes"
      source script/rbenv.sh
    fi
}

echo "***** updating Homebrew and installing rbenv"
brew update
brew install rbenv
install_ruby_build

set -e

echo "***** checking for ruby"
rbenv versions | grep $ruby_version || install_ruby_for_chorus
rbenv local $ruby_version

echo "***** checking for bundler"
gem list | grep bundler || install_bundler_for_chorus

echo "***** add rbenv to bash"
add_rbenv_to_bash

echo "***** setting up project"
bundle install
rake db:create db:migrate db:test:prepare legacy:setup db:test:prepare:legacy
script/test
