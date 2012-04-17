#!/bin/bash

ruby_version="1.9.3-p125"
# set -e

update_rvm() {
  curl -L get.rvm.io | bash -s stable
  rvm reload
}

install_ruby_for_chorus() {
  echo "installing ruby"
  export CC=/usr/bin/gcc
  rvm install $ruby_version
}

install_bundler_for_chorus() {
  echo "installing bundler"
  gem install bundler
}

source "$HOME/.rvm/scripts/rvm"

# uncomment, if you think you need it
# update_rvm

echo "checking for ruby"
rvm list | grep $ruby_version || install_ruby_for_chorus

echo "checking for bundler"
rvm $ruby_version
gem list | grep bundler || install_bundler_for_chorus
bundle install