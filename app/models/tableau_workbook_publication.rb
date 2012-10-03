class TableauWorkbookPublication < ActiveRecord::Base
  attr_accessible :dataset_id, :name, :workspace_id, :project_name

  belongs_to :dataset
  belongs_to :workspace

  def workbook_url
    base_url = Chorus::Application.config.chorus['tableau.url']
    "http://#{base_url}/workbooks/#{name}"
  end

  def project_url
    base_url = Chorus::Application.config.chorus['tableau.url']
    "http://#{base_url}/workbooks?fe_project.name=#{project_name}"
  end
end
