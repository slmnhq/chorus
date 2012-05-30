#!/usr/bin/env ruby

# The Continuous Packaging script requires the following on the CI machine:
# Sun VirtualBox to be installed.
# the following 'boxes' installed under certain names:
# centos5 http://dl.dropbox.com/u/9227672/centos-5.6-x86_64-netinstall-4.1.6.box
# centos6 http://dl.dropbox.com/u/9227672/CentOS-6.0-x86_64-netboot-4.1.6.box
# Suse 10 ??

require "net/http"
require "uri"

SHARED_DIR = "packaging/vagrant/shared"

system("mkdir -p #{SHARED_DIR}")
system "rake package"
package = Dir.glob("packaging/packages/chorus*").first
package_name = File.basename(package)

exit unless package

system "cp #{package} #{SHARED_DIR}"

def vagrant_ssh(cmds)
  system "vagrant ssh -c '#{cmds.join(' && ')}'"
end

#install imagemagick and hadoop
#echo "Installing imagemagick into /home/vagrant/imagemagick..."
#make imagemagick
#cd /tmp/downloads
#tar zxf ImageMagick-6.7.1-10.tar.gz
#cd ImageMagick-6.7.1-10
#./configure --prefix=/home/vagrant/imagemagick > /dev/null 2>&1
#make > /dev/null 2>&1
#make install > /dev/null 2>&1

Dir.chdir('packaging/vagrant/') do
  begin
    system('vagrant up')
    vagrant_ssh [
       "tar xzvf /shared/#{package_name}",
       "ruby install.rb",
       "export LD_LIBRARY_PATH=/home/vagrant/pgsql/lib/:$LD_LIBRARY_PATH &&
        export RAILS_ENV=production &&
        export PATH=/home/vagrant/pgsql/bin:/home/vagrant/rubygems/bin:/home/vagrant/ruby/lib/ruby/gems/1.9.1/gems/bundler-1.1.3/bin/:/home/vagrant/ruby/bin:$PATH &&
        cd /home/vagrant/app && nohup bundle exec rails s -d &"
    ]
    @db_response = vagrant_ssh [ "~/pgsql/bin/psql -p8543 postgres -c \"select * from pg_tables limit 1;\"" ]
    puts "Connecting to the db locally returned #{@db_response}"
    uri = URI.parse("http://33.33.33.33:3000/")
    response = Net::HTTP.get_response(uri)
    @web_response = (response.code == "200" ? 0 : 1)
    puts "Connecting to the web server returned #{@web_response}"
  ensure
    system('vagrant destroy --force')
    system "rm ../packages/#{package_name}"
    system "rm shared/#{package_name}"
  end
end

exit(@web_response)
