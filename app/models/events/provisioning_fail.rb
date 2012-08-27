require 'events/base'

module Events
  class ProvisioningFail < Base
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
    has_additional_data :error_message
  end
end