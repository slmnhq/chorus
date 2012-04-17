#!/bin/bash

ruby_version="1.9.3-p125"

set -e

install_ruby_for_chorus() {
  echo "installing ruby"
  rvm install $ruby_version
}

install_bundler_for_chorus() {
  echo "installing bundler"
  gem install bundler
}

echo "checking for ruby"
rvm list | grep $ruby_version || install_ruby_for_chorus

echo "checking for bundler"
source "$HOME/.rvm/scripts/rvm"
rvm $ruby_version
gem list | grep bundler || install_bundler_for_chorus
bundle install