class SearchPresenter < Presenter

  delegate :users, :instances, :num_found, to: :model

  def to_hash
    {
        :users => {
            :results => present_models_with_highlights(users),
            :numFound => num_found[:users]
        },

        :instances => {
            :results => present_models_with_highlights(instances),
            :numFound => num_found[:instances]
        }
    }
  end

  def present_models_with_highlights(models)
    models.collect do |model|
      hsh = present(model)
      hsh[:highlightedAttributes] = model.highlighted_attributes
      hsh
    end
  end
end