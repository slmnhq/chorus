# Install ruby

## If you are currently using RVM, remove it.

Mostly, you need to run

  rvm implode

You should also remove any references to RVM in your bash setup.  As a start, run...

  grep -i rvm ~/.bash* | grep -v .bash_history

Which will list files that reference RVM.  Edit those files to remove rvm completely.

Note that this will break RVM in other systems, notably the chorus-java project.  See the README in the chorus-java project for instructions on re-installing its Ruby with rbenv.

Start a new terminal.

## Run script/bootstrap

From the root directory of this project, run:

  script/bootstrap.sh

This script

* Installs rbenv
* Installs ruby (at the version found in .rbenv-version)
* Installs bundler
* Installs gems
* Creates databases
* Runs tests

