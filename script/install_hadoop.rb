#!/usr/bin/env ruby

require "yaml"

root_dir = File.expand_path("../..", __FILE__)
hadoop_dir = File.expand_path("vendor/hadoop", root_dir)
config_file = File.expand_path("config/hadoop.yml", root_dir)

def run(cmd)
  puts cmd
  system cmd
end

run "mkdir -p #{hadoop_dir}"
Dir.chdir(hadoop_dir)

hadoop_urls = YAML.load_file(config_file)

hadoop_urls.each do |version, url|
  filename = "#{version}.tar.gz"
  run "curl #{url} > #{filename}"
  run "tar -xzf #{filename}"
  run "rm #{filename}"
end


