require 'events/base'

module Events
  class TableauWorkbookPublished < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :workbook_name, :tableau_url
  end
end