require 'events/base'

module Events
  class ChorusViewCreated < Base
    scope :from_workfile, where(:target2_type => 'Workfile')
    scope :from_dataset, except(:target2_type => 'Workfile')

    has_targets :dataset, :source_object, :workspace
    has_activities :actor, :workspace, :dataset, :source_object
  end
end