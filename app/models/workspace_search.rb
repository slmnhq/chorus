class WorkspaceSearch < Search
  attr_reader :workspace_id

  validates_presence_of :workspace_id

  def initialize(current_user, params = {})
    @models_to_search = [Workspace, Workfile, Dataset]
    super
    @workspace_id = params[:workspace_id]
  end

  def build_search
    super
    @search.build do
      any_of do
        with :workspace_id, workspace_id if models_to_search.include?(Workspace) || models_to_search.include?(Workfile)
        with :found_in_workspace_id, workspace_id if models_to_search.include?(Dataset)
      end
    end
  end

  def num_found
    search.group(:grouping_id).total
  end

  def results
    return @results if @results
    search.associate_grouped_notes_with_primary_records
    @results = search.results
  end

  private

  def count_using_facets?
    false
  end
end