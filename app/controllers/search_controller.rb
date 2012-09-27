class SearchController < ApplicationController
  before_filter :require_admin, :only => [:reindex]

  def show
    present Search.new(current_user, params)
  end

  def type_ahead
    present Search.new(current_user, params.merge(:search_type => :type_ahead))
  end

  def reindex
    QC.enqueue("SolrIndexer.refresh_and_reindex", params.fetch(:types) { 'all' })
    render :json => {}
  end
end