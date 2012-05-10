#!/usr/bin/env ruby

require 'pathname'

# file_path = Pathname.new(ARGV[0])
filename = ARGV[0]

new_filename = filename.gsub(/views/, 'templates').gsub(/\.js/, '.jst.hbs')
puts "New: " + new_filename
short_name = new_filename.split("/").last
puts "Short: " + short_name
final_filename = `find app/assets/javascripts/templates -name '*#{short_name}*'`
puts "Final: " + final_filename
print final_filename
