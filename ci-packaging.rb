#!/usr/bin/env ruby

# The Continuous Packaging script requires the following on the CI machine:
# Sun VirtualBox to be installed.
# the following 'boxes' installed under certain names:
# centos5 http://dl.dropbox.com/u/9227672/centos-5.6-x86_64-netinstall-4.1.6.box
# centos6 http://dl.dropbox.com/u/9227672/CentOS-6.0-x86_64-netboot-4.1.6.box
# Suse 10 ??
 

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

begin
  Dir.chdir('packaging/vagrant/') do
    system('vagrant up')
    vagrant_ssh [
       "tar xzvf /shared/#{package_name}",
       "ruby install.rb"
    ]
    @db_response = vagrant_ssh [ "~/pgsql/bin/psql -p8543 chorus_rails_production -c \"select * from pg_tables limit 1;\"" ]
    puts "Connecting to the db locally returned #{@db_response}"
  end
ensure
  system('vagrant destroy --force')
  system "rm packaging/packages/#{package_name}"
  system "rm #{SHARED_DIR}/#{package_name}"
end

exit(@db_response)

