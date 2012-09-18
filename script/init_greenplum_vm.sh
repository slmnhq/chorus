#!/bin/sh

command=$1

FUSION_PATH=/Applications/VMWare\ Fusion.app
FUSION_BIN_PATH=$FUSION_PATH/Contents/Library

function start () {
	if [ ! -d gpdb421ee/ ]; then
	    echo "Greenplum Virtual Machine not found. Downloading..."
		# Download it here from a mirror or the Greenplum website
		echo "Extracting to gpdb421ee..."
		tar xzvf gpdb421ee.tar.gz

		echo "Starting greenplum."

		echo "Copying VMX configuration..."
		"$FUSION_BIN_PATH/vmrun" -T fusion start gpdb421ee/Greenplum\ 4.2.1.vmx

		# If the first time boot, write localhost.localdomain to hosts to speed up boot time
		# see http://blog.2ndquadrant.com/greenplum-ce-4-2-1-virtualbox/
		"$FUSION_BIN_PATH/vmrun" -gu root -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "sed -i 's/localhost /localhost.localdomain localhost /' /etc/hosts"

		ssh-keygen -f gpdb421ee/id_rsa -N ''
	fi

	"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "/sbin/ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print \$1}' > ~/GREENPLUM_IP"
	"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password copyFileFromGuestToHost gpdb421ee/Greenplum\ 4.2.1.vmx /home/gpadmin/GREENPLUM_IP ./GREENPLUM_IP
	echo "Exchanging keys"
	"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password copyFileFromHostToGuest gpdb421ee/Greenplum\ 4.2.1.vmx ./gpdb421ee/id_rsa.pub /home/gpadmin/.ssh/authorized_keys
	"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "chmod 400 /home/gpadmin/.ssh/authorized_keys"
	GREENPLUM_IP=`cat ./GREENPLUM_IP`
	echo "Add the following to /etc/hosts with sudo:"
	echo "$GREENPLUM_IP local-greenplum"
}

function do_ssh() {
	GREENPLUM_IP=`cat ./GREENPLUM_IP`
	echo sshing to $GREENPLUM_IP
	ssh gpadmin@$GREENPLUM_IP -i ./gpdb421ee/id_rsa
}

function stop() {
	echo "Stopping greenplum."
	"$FUSION_BIN_PATH/vmrun" -T fusion stop gpdb421ee/Greenplum\ 4.2.1.vmx soft
}

function usage () {
  script=`basename $0`
  echo "$script is a utility to start, stop, restart, or monitor a Greenplum 4.2 virtual machine."
  echo
  echo Usage:
  echo "  $script start           start services"
  echo "  $script stop            stop services"
  return 1
}

case $command in
    start )
        start
        ;;
    stop )
        stop
        ;;
	ssh )
		do_ssh
		;;
    * )
        usage
        ;;
esac