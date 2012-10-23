class TableauWorkbookPublication < ActiveRecord::Base
  attr_accessible :dataset_id, :name, :workspace_id, :project_name

  belongs_to :dataset
  belongs_to :workspace
  belongs_to :linked_tableau_workfile

  def workbook_url
    "http://#{base_url}/workbooks/#{name}"
  end

  def project_url
    "http://#{base_url}/workbooks?fe_project.name=#{project_name}"
  end

  def base_url
    base_url = Chorus::Application.config.chorus['tableau.url']
    port = Chorus::Application.config.chorus['tableau.port']
    base_url += ":#{port}" if port && port != 80
    base_url
  end
end
