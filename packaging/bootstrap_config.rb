#!/usr/bin/env ruby

require 'yaml'
require 'securerandom'
require 'fileutils'

generated_password = SecureRandom.hex

path = File.expand_path(File.dirname(__FILE__) + '/../')

chorus_home = ENV['CHORUS_HOME']
FileUtils.cp "#{path}/config/chorus.yml.example", chorus_home + '/shared/chorus.yml'

database_config = YAML.load_file("#{path}/config/database.yml.example")
database_config['production']['password'] = generated_password

File.open(chorus_home + '/shared/database.yml', 'w') do |file|
  YAML.dump(database_config, file)
end

`cd #{chorus_home} && ./postgres/bin/psql  -d postgres -p8543 -c "CREATE ROLE #{database_config['production']['username']} PASSWORD '#{generated_password}' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN"`