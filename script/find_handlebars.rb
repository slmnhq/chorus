#!/usr/bin/env ruby

require 'pathname'

# file_path = Pathname.new(ARGV[0])
filename = ARGV[0]

new_filename = filename.gsub(/views/, 'templates').gsub(/\.js/, '.handlebars')

short_name = new_filename.split("/").last

final_filename = `find app/assets/javascripts/templates -name '*#{short_name}*'`

print final_filename


