#!/bin/sh

# run this from the rails root.

command=$1

set -e

FUSION_PATH=/Applications/VMWare\ Fusion.app
FUSION_BIN_PATH=$FUSION_PATH/Contents/Library

function start () {
	if [ ! -d gpdb421ee/ ]; then
	    echo "Greenplum Virtual Machine not found."

		mkdir -p tmp/
		if [ ! -e tmp/gpdb421ee.tar.gz ]; then
			echo "Greenplum VM archive not found. Downloading from local mirror..."
			wget -O tmp/gpdb421ee.tar.gz http://greenplum-ci/~ci/gpdb421ee.tar.gz
		fi

		# Download it here from a mirror or the Greenplum website
		echo "Extracting ./tmp/gpdb421ee.tar.gz  to ./gpdb421ee..."
		tar xzf tmp/gpdb421ee.tar.gz

		echo "Starting greenplum."
		"$FUSION_BIN_PATH/vmrun" -T fusion start gpdb421ee/Greenplum\ 4.2.1.vmx nogui

		# If the first time boot, write localhost.localdomain to hosts to speed up boot time
		# see http://blog.2ndquadrant.com/greenplum-ce-4-2-1-virtualbox/
		"$FUSION_BIN_PATH/vmrun" -gu root -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "sed -i 's/localhost /localhost.localdomain localhost /' /etc/hosts"

		echo "Generating SSH identity..."
		ssh-keygen -f gpdb421ee/id_rsa -N ''
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password copyFileFromHostToGuest gpdb421ee/Greenplum\ 4.2.1.vmx ./gpdb421ee/id_rsa.pub /home/gpadmin/vmware_host_id_rsa.pub
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "cat /home/gpadmin/vmware_host_id_rsa.pub >> /home/gpadmin/.ssh/authorized_keys"
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "chmod 400 /home/gpadmin/.ssh/authorized_keys"

		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "/sbin/ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print \$1}' > ~/GREENPLUM_IP"
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password copyFileFromGuestToHost gpdb421ee/Greenplum\ 4.2.1.vmx /home/gpadmin/GREENPLUM_IP ./GREENPLUM_IP
		GREENPLUM_IP=`cat ./GREENPLUM_IP`

		#sudo /sbin/service iptables stop
		"$FUSION_BIN_PATH/vmrun" -gu root -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "/sbin/service iptables stop"
		"$FUSION_BIN_PATH/vmrun" -gu root -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "/sbin/chkconfig iptables off"

		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "echo 'host     all         chorus         $GREENPLUM_IP/24     md5' >> /dbfast1/master/gpseg-1/pg_hba.conf"



		echo "starting Greenplum database"
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "source /home/gpadmin/.profile; /usr/local/greenplum-db/bin/gpstart -a"
		echo "Creating chorus user"
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "createuser -s chorus"
		echo "Creating chorus password"
		"$FUSION_BIN_PATH/vmrun" -gu gpadmin -gp password runScriptInGuest gpdb421ee/Greenplum\ 4.2.1.vmx /bin/sh "psql postgres -c \"alter user chorus with password 'password';\""


		echo "Add the following to /etc/hosts with sudo:"
		echo "$GREENPLUM_IP local-greenplum"
	else
		"$FUSION_BIN_PATH/vmrun" -T fusion start gpdb421ee/Greenplum\ 4.2.1.vmx nogui
	fi
}

function do_ssh() {
	GREENPLUM_IP=`cat ./GREENPLUM_IP`
	echo sshing to $GREENPLUM_IP
	ssh gpadmin@$GREENPLUM_IP -i ./gpdb421ee/id_rsa
}

function stop() {
	echo "Stopping greenplum..."
	"$FUSION_BIN_PATH/vmrun" -T fusion stop gpdb421ee/Greenplum\ 4.2.1.vmx soft
	echo "Done."
}

function snapshot() {
	echo "Creating a snapshot..."
	"$FUSION_BIN_PATH/vmrun" -T fusion snapshot gpdb421ee/Greenplum\ 4.2.1.vmx clean
	echo "Done."
}

function revert() {
	echo "Reverting a snapshot..."
	"$FUSION_BIN_PATH/vmrun" -T fusion revertToSnapshot gpdb421ee/Greenplum\ 4.2.1.vmx clean
	echo "VM reverted and shut down."
}

function status() {
	"$FUSION_BIN_PATH/vmrun" list
}

function remove() {
	"$FUSION_BIN_PATH/vmrun" -T fusion deleteVM gpdb421ee/Greenplum\ 4.2.1.vmx
	echo "Removing greenplum VM..."
	rm -r gpdb421ee
	echo "Done."
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
	remove )
		remove
		;;
	status )
		status
		;;
	snapshot )
		snapshot
		;;
	revert )
		revert
		;;
    * )
        usage
        ;;
esac