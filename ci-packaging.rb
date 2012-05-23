#!/usr/bin/env ruby

# # rake package
# cd packaging/vagrant/
# cp ../packages/something.tar shared/
# vagrant ssh -c 'untar /shared/something.tar ~/'
# vagrant ssh -c 'ruby install.rb'
# psql chorus --host 33.33.33.33 --port 8543

Dir.chdir('packaging/vagrant/') do
  system('vagrant up')
  p = system('ping -c 1 -t 1 33.33.33.33')
  system('vagrant destroy')
  exit_code = p ? 0 : 1
end

exit(exit_code)

