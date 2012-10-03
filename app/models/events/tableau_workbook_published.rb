require 'events/base'

module Events
  class TableauWorkbookPublished < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :workbook_name, :project_name, :workbook_url, :project_url
  end
end