#!/bin/sh

CHORUSDIR=${HOME}/workspace/chorusrails

ps aux | grep -- '-p8543' | grep -v grep | awk '{print $2}' | xargs kill -9

if [ -f ${CHORUSDIR}/var/db/postmaster.pid ];
then
    rm ${CHORUSDIR}/var/db/postmaster.pid
fi

if [ ! -d ${CHORUSDIR}/var/db ];
then
    pg_ctl init -D ${CHORUSDIR}/var/db
else
    CREATED_DB=1
fi

pg_ctl start -D $CHORUSDIR/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5

if [ $CREATED_DB ];
then
    dropuser -h localhost -p 8543 edcadmin
    createuser -h localhost -p 8543 -sdr edcadmin;
fi

$CHORUSDIR/script/reset_db.sh
pg_ctl stop -D $CHORUSDIR/var/db
