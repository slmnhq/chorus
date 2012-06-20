ps aux | grep -- '-p8543' | grep -v grep | awk '{print $2}' | xargs kill -9

if [ -f ~/workspace/chorusrails/var/db/postmaster.pid ];
then
    rm ~/workspace/chorusrails/var/db/postmaster.pid
fi

if [ ! -d ~/workspace/chorusrails/var/db ];
then
    pg_ctl init -D ~/workspace/chorusrails/var/db
    CREATED_DB=1
fi

pg_ctl start -D ~/workspace/chorusrails/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5

if [ $CREATED_DB ];
then
    dropuser -h localhost -p 8543 edcadmin
    createuser -h localhost -p 8543 -sdr edcadmin;
fi

script/reset_db.sh
pg_ctl stop -D ~/workspace/chorusrails/var/db
