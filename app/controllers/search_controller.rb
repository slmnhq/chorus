class SearchController < ApplicationController
  before_filter :require_admin, :only => [:reindex]

  def show
    present Search.new(current_user, params)
  end

  def workspaces
    present MyWorkspacesSearch.new(current_user, params), :presenter_options => { :presenter_class => 'SearchPresenter' }
  end

  def type_ahead
    present TypeAheadSearch.new(current_user, params)
  end

  def reindex
    QC.enqueue("SolrIndexer.refresh_and_reindex", params.fetch(:types) { 'all' })
    render :json => {}
  end
end