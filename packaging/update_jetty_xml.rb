chorus_home = File.expand_path(File.dirname(__FILE__) + '/../')
require File.join(chorus_home, 'config', 'boot')
require 'nokogiri'
require File.join(chorus_home, 'app/models/chorus_config')

jetty_xml_file = File.join(chorus_home, 'vendor', 'jetty', 'jetty.xml')

chorus_config = ChorusConfig.new(chorus_home)

xml_doc = Nokogiri::XML(File.new(jetty_xml_file))
max_threads = xml_doc.xpath("/Configure/Set[@name='ThreadPool']/New/Set[@name='maxThreads']").first
max_threads.content = chorus_config['webserver_threads']

min_threads = xml_doc.xpath("/Configure/Set[@name='ThreadPool']/New/Set[@name='minThreads']").first
if min_threads.content.to_i > chorus_config['webserver_threads'].to_i
  min_threads.content = chorus_config['webserver_threads']
end

File.open(jetty_xml_file, 'w') do |f|
  f.write(xml_doc.to_xml)
end