require 'erb'
require 'yaml'

chorus_home = File.expand_path(File.dirname(__FILE__) + '/../')
destination_path = chorus_home + '/packaging/nginx_dist/nginx_data/conf'
nginx_template_path = chorus_home + '/packaging/nginx.conf.erb'
chorus_config = YAML.load_file chorus_home + '/config/chorus.yml'
rails_env = ENV['RAILS_ENV']

template = ERB.new File.read(nginx_template_path)

File.open("#{destination_path}/nginx.conf", 'w') do |f|
  f.write template.result(binding)
end