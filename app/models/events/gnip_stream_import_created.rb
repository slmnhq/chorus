require 'events/base'

module Events
  class GnipStreamImportCreated < Base
    has_targets :gnip_instance, :dataset, :workspace
    has_activities :workspace, :dataset, :gnip_instance
    has_additional_data :destination_table
  end
end