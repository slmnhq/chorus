#!/bin/bash

ruby_version=$1

install_ruby_for_chorus() {
  echo "***** installing ruby"
  export CC=/usr/bin/gcc
  rbenv install $ruby_version || true
  rbenv rehash
}

install_bundler_for_chorus() {
  echo "***** installing bundler"
  gem install bundler
  rbenv rehash
}

set -e

echo "***** checking for ruby"
rbenv versions | grep $ruby_version || install_ruby_for_chorus
echo "***** ensuring ruby $ruby_version"
ruby -v
rbenv version | grep $ruby_version

echo "***** checking for bundler"
gem list | grep bundler || install_bundler_for_chorus
