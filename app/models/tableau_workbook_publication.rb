class TableauWorkbookPublication < ActiveRecord::Base
  attr_accessible :dataset_id, :name, :tableau_url, :workspace_id

  belongs_to :dataset
  belongs_to :workspace

end
