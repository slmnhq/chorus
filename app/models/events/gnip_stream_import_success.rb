require 'events/base'

module Events
  class GnipStreamImportSuccess < Base
    has_targets :gnip_instance, :dataset, :workspace
    has_activities :workspace, :dataset, :gnip_instance, :global
  end
end