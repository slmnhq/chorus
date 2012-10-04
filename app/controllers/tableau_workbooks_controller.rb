require 'tableau_workbook'
require 'optparse'

class TableauWorkbooksController < ApplicationController
  def create
    dataset = Dataset.find(params[:dataset_id])
    workbook = create_new_workbook(dataset, params[:tableau_workbook][:name])

    if workbook.save
      publication = TableauWorkbookPublication.create!(
          :name => params[:tableau_workbook][:name],
          :dataset_id => dataset.id,
          :workspace_id => params[:workspace_id],
          :project_name => "Default"
      )
      Events::TableauWorkbookPublished.by(current_user).add(
          :workbook_name => publication.name,
          :dataset => publication.dataset,
          :workspace => publication.workspace,
          :workbook_url => publication.workbook_url,
          :project_name => publication.project_name,
          :project_url => publication.project_url
      )
      if params[:tableau_workbook][:create_work_file] == "true"
        workfile = publication.workspace.workfiles.build(file_name: "#{params[:tableau_workbook][:name]}.twb")
        workfile.owner = current_user
        version = workfile.versions.build
        version.contents = nil
        version.owner = current_user
        version.modifier = current_user
        workfile.save!
      end
      render :json => {
          :response => {
              :name => publication.name,
              :dataset_id => publication.dataset_id,
              :id => publication.id,
              :url => publication.workbook_url,
              :project_url => publication.project_url
          }
      }, :status => :created
    else
      puts workbook.errors.full_messages.join(". ")
      present_errors({:fields => {:tableau =>
             { :GENERIC => {:message => workbook.errors.full_messages.join(". ")}}}},
            {:status => :unprocessable_entity})
    end
  end

  private

  def create_new_workbook(dataset, workbook_name)
    login_params = {
        :name => workbook_name,
        :server => Chorus::Application.config.chorus['tableau.url'],
        :port => Chorus::Application.config.chorus['tableau.port'],
        :tableau_username => Chorus::Application.config.chorus['tableau.username'],
        :tableau_password => Chorus::Application.config.chorus['tableau.password'],
        :db_username => dataset.gpdb_instance.account_for_user!(current_user).db_username,
        :db_password => dataset.gpdb_instance.account_for_user!(current_user).db_password,
        :db_host => dataset.gpdb_instance.host,
        :db_port => dataset.gpdb_instance.port,
        :db_database => dataset.schema.database.name,
        :db_schema => dataset.schema.name}

    if dataset.is_a?(ChorusView)
      TableauWorkbook.new(login_params.merge!(:query => dataset.query))
    else
      TableauWorkbook.new(login_params.merge!(:db_relname => dataset.name))
    end
  end
end