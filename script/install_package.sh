echo "Installing chorus..."

# with the Chorus package as first argument, untar to tmp
tar xf $1 --directory=/tmp/


echo "Installing postgres into /home/vagrant/pgsql..."
# extract postgres
cd /tmp/downloads/
tar xzf postgresql-9.0.4.tar.gz
cd postgresql-9.0.4/

# Configure, compile and install postgres
# Need to set the installation prefix to the user's HOMEDIR/psql
./configure --prefix=/home/vagrant/pgsql > /dev/null 2>&1
make > /dev/null 2>&1
make install > /dev/null 2>&1

# make ruby

# make imagemagick

# make hadoop

cd ~/
tar xf /tmp/downloads/app.tar

#Todo: disable TRUST authentication
echo "Creating and starting chorus db..."
/home/vagrant/pgsql/bin/pg_ctl init -D ~/chorusrails/var/db -U vagrant
/home/vagrant/pgsql/bin/pg_ctl start -D ~/chorusrails/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5
/home/vagrant/pgsql/bin/createuser -h localhost -p 8543 -sdr edcadmin

# bundle exec rake db:reset
# bundle exec rake db:test:prepare
# bundle exec rake legacy:setup
#

# /home/vagrant/pgsql/bin/pg_ctl -D ~/chorusrails/var/db/ stop
# rm -rf ~/chorusrails
# rm -rf ~/pgsql
# rm -rf /tmp/downloads
