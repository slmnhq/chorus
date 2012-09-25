class WorkspaceSearch < Search
  attr_reader :workspace_id

  validates_presence_of :workspace_id

  def initialize(current_user, params = {})
    super
    @models_to_search = [Workspace, Workfile, Dataset]
    @workspace_id = params[:workspace_id]
  end

  def build_search
    super
    @search.build do
      with :workspace_id, workspace_id
    end
  end

  def num_found
    search.group(:grouping_id).total
  end

  def results
    search.associate_grouped_notes_with_primary_records
    search.results
  end

  private

  def count_using_facets?
    false
  end
end