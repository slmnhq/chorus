#!/usr/bin/env ruby

require 'pathname'

file_path = Pathname.new(ARGV[0])
filename = file_path.basename.to_s

in_spec = filename =~ /_spec\.js/
going_to_spec = !in_spec

def find_spec_containing(filename)
    search_path = "**/spec/**/#{filename}*_spec.js"
    Pathname.glob(search_path).first
end

def find_impl_containing(filename)
    search_path = "**/public/**/#{filename}*.js"
    Pathname.glob(search_path).first
end

potential_inconsistencies = ["view", "page", "dialog", "alert"]

if going_to_spec
    filename.gsub!(/\.js/, '')

    if spec_path = find_spec_containing(filename)
        print spec_path
    else
        potential_inconsistencies.each {|inconsistency| filename.gsub!(/_#{inconsistency}/, '')}
        print find_spec_containing(filename)
    end
else
    filename.gsub!(/\_spec.js/, '')

    if impl_path = find_impl_containing(filename)
        print impl_path
    else
        potential_inconsistencies.each {|inconsistency| filename.gsub!(/_#{inconsistency}/, '')}
        print find_impl_containing(filename)
    end
end

