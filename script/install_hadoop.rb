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

hadoop_urls = YAML.load_file(config_file)['versions']

hadoop_urls.each do |version, url|
  tar_filename = "temp_tar"
  run "curl #{url} > #{tar_filename}"
  run "mkdir -p #{version}"
  run "tar --extract --file=#{tar_filename} --strip-components=1 --directory=#{version}"
  run "rm #{tar_filename}"
end


