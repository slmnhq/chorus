require_relative '../config/environment'
require 'queue_classic'
require 'clockwork'
include Clockwork

handler do |job|
  QC.enqueue("InstanceStatus.check")
end

every(Chorus::Application.config.chorus['instance_poll_interval_minutes'].minutes, 'check.instance.status.job')

run