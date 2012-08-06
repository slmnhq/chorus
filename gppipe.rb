#!/usr/bin/env ruby
# script/rails runner gppipe.rb my_pipe

require 'fileutils'
require 'socket'

if ARGV.length != 1
  puts "Missing pipe name"
  puts "Usage: gppipe.rb <pipe_name>"
  exit(1)
end

pipe_name = ARGV[0]

def gpdb1
  connection = ActiveRecord::Base.postgresql_connection(
      :host => "chorus-gpdb42",
      :port => 5432,
      :database => "ChorusAnalytics",
      :username => "gpadmin",
      :password => "secret",
      :adapter => "jdbcpostgresql"
  )
  yield connection if block_given?
rescue ActiveRecord::JDBCError => e
  raise e, friendly_message
ensure
  connection.try(:disconnect!)
end

def gpdb2
  connection = ActiveRecord::Base.postgresql_connection(
      :host => "chorus-gpdb41",
      :port => 5432,
      :database => "ChorusAnalytics",
      :username => "gpadmin",
      :password => "secret",
      :adapter => "jdbcpostgresql"
  )
  yield connection if block_given?
rescue ActiveRecord::JDBCError => e
  raise e, friendly_message
ensure
  connection.try(:disconnect!)
end

data_dir = 'tmp/gpfdist'
pipe_file = File.join(data_dir, pipe_name)

at_exit do
  FileUtils.rm pipe_file
end

system "mkfifo #{pipe_file}"

thr = Thread.new do
  gpdb1 do |conn|
    p "doing INSERT INTO"
    #conn.exec_query("USE schema #{export_schema_name}")
    conn.exec_query("CREATE WRITABLE EXTERNAL TABLE #{pipe_name}(c1 int) LOCATION ('gpfdist://gillette:8000/#{pipe_name}') FORMAT 'TEXT';")
    conn.exec_query("INSERT INTO #{pipe_name} SELECT * FROM generate_series(1,1000);")
    conn.exec_query("DROP EXTERNAL TABLE #{pipe_name};")
  end
end

gpdb2 do |conn|
  # new_schema must already exist, required in GPDB 4.1
  p "doing SELECT"
  conn.exec_query("CREATE EXTERNAL TABLE new_schema.#{pipe_name}(c1 int) LOCATION('gpfdist://gillette:8001/#{pipe_name}') FORMAT 'TEXT';")
  p conn.exec_query("SELECT * FROM new_schema.#{pipe_name};")
  conn.exec_query("DROP EXTERNAL TABLE new_schema.#{pipe_name};")
end

thr.join

p "I am done."
