class SearchPresenter < Presenter

  delegate :users, :instances, :num_found, :workspaces, :workfiles, to: :model

  def to_hash
    {
        :users => {
            :results => present_models_with_highlights(users),
            :numFound => num_found[:users]
        },

        :instances => {
            :results => present_models_with_highlights(instances),
            :numFound => num_found[:instances]
        },

        :workspaces => {
            :results => present_models_with_highlights(workspaces),
            :numFound => num_found[:workspaces]
        },

        :workfiles => {
            :results => present_models_with_highlights(workfiles),
            :numFound => num_found[:workfiles]
        }
    }
  end

  def present_models_with_highlights(models)
    models.collect do |model|
      m = (model.is_a? Workfile) ? model.last_version : model
      hsh = present(m)

      hsh[:highlighted_attributes] = model.highlighted_attributes
      hsh[:comments] = model.search_result_comments
      hsh
    end
  end
end