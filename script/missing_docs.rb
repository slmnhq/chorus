#!/usr/bin/env ruby

def header(title)
  puts ""
  puts title
  puts "=" * 20
end

class Route < Struct.new(:method, :path)
  include Comparable
  def to_s
    "#{method.upcase} #{path}"
  end

  def <=> other
    path <=> other.path
  end
end

routes = `rake routes`.split("\n").map { |line|
  match = line.match(/(\w+) +(\/[^( ]+)/)
  match && Route.new(match[1].downcase, match[2])
}.compact

header "Routes"
routes.each { |r| puts r }

existing_docs = `egrep -Rh "^\\W*(post|put|get|delete)" spec/acceptance`.split("\n").map { |line|
  match = line.match(/(\w+) +['"](\S+)['"]/)
  match && Route.new(match[1].downcase, match[2])
}.compact

header "Existing docs"
existing_docs.each { |r| puts r }

header "Missing docs"
missing = routes - existing_docs
missing.sort.each { |r| puts r }
