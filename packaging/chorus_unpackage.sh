# TODO make the install script work from any directory location

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

echo "Installing ruby into /home/vagrant/ruby..."
# make ruby
cd /tmp/downloads/
tar xzf ruby-src.tar.gz
cd ruby-1.9.3-p125
./configure --prefix=/home/vagrant/ruby > /dev/null 2>&1
make > /dev/null 2>&1
make install > /dev/null 2>&1

# install rubygems
cd /tmp/downloads
tar xzf rubygems-1.8.24.tgz 
cd rubygems-1.8.24  
/home/vagrant/ruby/bin/ruby setup.rb --prefix=~/rubygems/

# install bundler from vendor/cache
cd /tmp/downloads
/home/vagrant/rubygems/bin/gem install --local bundler-1.1.3.gem --no-ri --no-rdoc

echo "Installing imagemagick into /home/vagrant/imagemagick..."
# make imagemagick
cd /tmp/downloads
tar zxf ImageMagick-6.7.1-10.tar.gz
cd ImageMagick-6.7.1-10
./configure --prefix=/home/vagrant/imagemagick > /dev/null 2>&1
make > /dev/null 2>&1
make install > /dev/null 2>&1

# make hadoop

echo "extracting application..."
cd ~/
tar xf /tmp/downloads/app.tar 
export RAILS_ENV=production

#Todo: disable TRUST authentication
echo "Creating and starting chorus db..."
/home/vagrant/pgsql/bin/pg_ctl init -D ~/chorusrails/var/db -U vagrant
/home/vagrant/pgsql/bin/pg_ctl start -D ~/chorusrails/var/db -o "-h localhost -p8543 --bytea_output=escape"
sleep 5
/home/vagrant/pgsql/bin/createuser -h localhost -p 8543 -sdr edcadmin

PATH=/home/vagrant/ruby/bin:$PATH
PATH=/home/vagrant/rubygems/bin:$PATH
PATH=/home/vagrant/pgsql/bin:$PATH

# TODO this will connect to the internet, and fail if it does not succeed
/home/vagrant/ruby/lib/ruby/gems/1.9.1/gems/bundler-1.1.3/bin/bundle install --local

gem install pg --local vendor/cache/pg-0.13.2.gem -- --with-pg-config=/home/vagrant/pgsql/bin/pg_config --with-pg-dir=/home/vagrant/pgsql

LD_LIBRARY_PATH=/home/vagrant/pgsql/lib/ 

bundle exec rake db:create
bundle exec rake db:migrate
bundle exec rake db:seed
bundle exec rake assets:compile


# /home/vagrant/pgsql/bin/pg_ctl -D ~/chorusrails/var/db/ stop
# rm -rf ~/chorusrails
# rm -rf ~/pgsql
# rm -rf /tmp/downloads
