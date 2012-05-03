ENV["QC_DATABASE_URL"] = "postgres://edcadmin:secret@localhost:8543/queue_classic_chorus"
require 'queue_classic'

require 'clockwork'
include Clockwork

handler do |job|
  puts "Running #{job}"
  QC.enqueue("Kernel.puts" , job)
end

every(10.seconds, 'frequent.job')
every(3.minutes, 'less.frequent.job')
