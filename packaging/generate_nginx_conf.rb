require 'erb'
require 'yaml'

chorus_home = File.expand_path(File.dirname(__FILE__) + '/../../../')
destination_path = chorus_home + '/nginx_dist/nginx_data/conf'
nginx_template_path = chorus_home + '/current/packaging/nginx.conf.erb'
chorus_config = YAML.load_file chorus_home + '/current/config/chorus.yml'

template = ERB.new File.read(nginx_template_path)

File.open("#{destination_path}/nginx.conf", 'w') do |f|
  f.write template.result(binding)
end