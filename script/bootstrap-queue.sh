#!/bin/bash
CHORUSDIR=${HOME}/workspace/chorusrails
pg_ctl start -D ${CHORUSDIR}/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5

createdb queue_classic_chorus -Uedcadmin -p8543 -hlocalhost

pg_ctl stop -D ${CHORUSDIR}/var/db

