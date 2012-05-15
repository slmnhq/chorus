require 'queue_classic'
require './config/environment.rb'

require 'clockwork'
include Clockwork

handler do |job|
  QC.enqueue("Gpdb::InstanceStatus.check")
  QC.enqueue("Hdfs::InstanceStatus.check")
end

every(1.minute, 'check.instance.status.job')
