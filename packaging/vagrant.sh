vagrant box add centos5 http://dl.dropbox.com/u/8072848/centos-5.7-x86_64.box
# make sure Vagrantfile exists
vagrant init centos5
# wait for it to start
vagrant ssh
# do stuff