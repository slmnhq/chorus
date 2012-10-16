require 'events/base'

module Events
  class GnipStreamImportFailed < Base
    has_targets :gnip_instance, :workspace
    has_activities :workspace, :gnip_instance
    has_additional_data :destination_table, :error_message
  end
end