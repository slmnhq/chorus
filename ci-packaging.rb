#!/usr/bin/env ruby

SHARED_DIR = "packaging/vagrant/shared"

system("mkdir -p #{SHARED_DIR}")
#system "rake package"
#package = Dir.glob("packaging/packages/chorus*").first
#package_name = File.basename(package)

#exit unless package

#system "mv #{package} #{SHARED_DIR}"

Dir.chdir('packaging/vagrant/') do
  begin
    system('vagrant up')
    p = system('ping -c 1 -t 1 33.33.33.33')
    @ping_response = p ? 0 : 1
    puts "Pinging the machine returned #{@ping_response}"
  ensure
    system('vagrant destroy --force')
  end
end

# vagrant_ssh [
#   "tar xzvf /shared/#{package_name}",
#   "cd #{package_name}",
#   "ruby install.rb"
# ]

def vagrant_ssh(cmds)
  system "vagrant ssh -c '#{cmds.join(' && ')}'"
end

exit(@ping_response)

