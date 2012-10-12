require 'events/base'

module Events
  class TableauWorkfileCreated < Base
    has_targets :dataset, :workfile, :workspace
    has_activities :actor, :workspace, :dataset, :workfile
    has_additional_data :workbook_name
  end
end