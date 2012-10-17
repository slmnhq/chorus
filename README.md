#Greenplum Chorus

This file contains instructions to get started on Mac OSX.  If you are running Linux, it shouldn't be too different.

###Postgres

Install postgres if you don't have it

    brew install postgres

You may have to increase some memory limits:

    sudo sysctl -w kern.sysv.shmall=65536
    sudo sysctl -w kern.sysv.shmmax=16777216

You can put these settings in your `/etc/sysctl.conf` file, and they will become effective whenever you boot:

    kern.sysv.shmall=65536
    kern.sysv.shmmax=16777216

If you don't have a `/etc/sysctl.conf` file, just create one.

OSX Lion may not retain these settings between reboots, so you may see the message
could not create shared memory segment: Invalid argument` indicating that the `sysctl` commands need to be run again.

Chorus assumes you have a postgres installation at the root of the Chorus repo called "postgres/" so you will need to
create a symlink from there to where you installed postgres.

### XCode

You need XCode for a compiler

### Install ruby

#### If you are currently using RVM, remove it.

Mostly, you need to run

    rvm implode

You should also remove any references to RVM in your bash setup.  As a start, run...

    grep -i rvm ~/.bash* | grep -v .bash_history

Which will list files that reference RVM.  Edit those files to remove rvm completely.

Note that this will break RVM in other systems, notably the chorus-java project.  See the README in the chorus-java project for the new way to install Ruby.

Start a new terminal.

#### Run script/bootstrap

From the root directory of this project, run:

    script/bootstrap.sh
    
Note: Ignore all db errors for now.

This script

* Installs rbenv
* Installs ruby (at the version found in .rbenv-version)
* Installs bundler
* Installs gems
* Creates databases
* Runs tests

For Macs only:
brew install qt

## Development

    foreman start
    If foreman fails to start run:
    bundle

    In another terminal window, run:
	RAILS_ENV=development CHORUS_HOME=. packaging/chorus_control.sh start

    Run the following rake commands, ignore DB errors.
    rake db:migrate
    rake db:test:prepare

Application will be on http://localhost:8080

    If you cannot log in as chorusadmin, you first need to initialize the it in the database with

    rake db:seed

## HDFS Service
	To be able to connect to HDFS you need to run:
	script/start_hdfs_service.sh
	
### Testing:

    rake (to run specs for the application)

    and

    rake all (to run specs for the application and to generate API docs)

