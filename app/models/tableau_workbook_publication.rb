class TableauWorkbookPublication < ActiveRecord::Base
  attr_accessible :dataset_id, :name, :workspace_id

  belongs_to :dataset
  belongs_to :workspace

  def tableau_url
    base_url = Chorus::Application.config.chorus['tableau.url']
    "http://#{base_url}/workbooks/#{name}"
  end
end
