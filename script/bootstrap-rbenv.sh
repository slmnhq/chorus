#!/bin/bash

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

add_rbenv_to_bash() {
  profile_includes="$HOME/.bash_profile_includes"
  if [ -e "$profile_includes" ]
  then
    rbenv_config="$profile_includes/rbenv.sh"
    if [ ! -e "$rbenv_config" ]
    then
      echo "***** Adding rbenv init to bash profile includes"
      cp script/rbenv.sh $rbenv_config
      source script/rbenv.sh
    fi
  else
    bash_profile="$HOME/.bash_profile"
    touch $bash_profile
    grep rbenv $bash_profile || cat script/rbenv.sh >> $bash_profile
    source script/rbenv.sh
  fi
}

echo "***** updating Homebrew and installing rbenv"
brew update
brew install rbenv --HEAD
install_ruby_build

echo "***** checking for rbenv in bash"
add_rbenv_to_bash
