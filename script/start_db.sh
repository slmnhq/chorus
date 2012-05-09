ps aux | grep -- '-p8543' | grep -v grep | awk '{print $2}' | xargs kill -9
if [ -f ~/workspace/chorusrails/var/db/postmaster.pid ];
then
    rm ~/workspace/chorusrails/var/db/postmaster.pid
fi

postgres -D ~/workspace/chorusrails/var/db -h localhost -p8543 --bytea_output=escape
