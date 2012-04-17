#!/usr/bin/env ruby

require 'pathname'

# file_path = Pathname.new(ARGV[0])
filename = ARGV[0]
in_spec = filename =~ /_spec/
going_to_spec = !in_spec

related_file = if going_to_spec
  filename.gsub(/^app/, 'spec').gsub(/.rb$/, '_spec.rb')
else
  filename.gsub(/^spec/, 'app').gsub(/_spec.rb$/, '.rb')
end

print related_file
