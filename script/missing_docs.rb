#!/usr/bin/env ruby

def header(title)
  puts ""
  puts title
  puts "=" * 20
end

routes = `rake routes | awk '{print $1}'`.split("\n")
routes.reject! do |line|
  ["GET", "POST", "PUT", "DELETE"].include? line
end

header "Routes"
routes.each { |r| puts r }

existing_docs = `ls spec/acceptance`.split("\n")

existing_docs.map! do |doc|
  doc.split("_spec.rb").first
end

header "Existing docs"
existing_docs.each { |r| puts r }

header "Missing docs"
missing = routes - existing_docs
missing.each { |r| puts r }
