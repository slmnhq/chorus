class WorkspaceSearchPresenter < SearchPresenterBase
  def to_hash
    {
        :this_workspace => {
            :results => present_workspace_models_with_highlights(model.results),
            :numFound => model.num_found
        }
    }
  end
end