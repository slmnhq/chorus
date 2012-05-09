#!/usr/bin/env ruby

require 'socket'

started = false

sleep 5

until started do
  sleep 0.5
  begin
    TCPSocket.new('localhost', 8543)
    started = true
  rescue Errno::ECONNREFUSED => e
  end
end

exec "bundle exec rake qc:work"