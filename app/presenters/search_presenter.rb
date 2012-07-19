class SearchPresenter < Presenter

  delegate :users, :instances, :num_found, :workspaces, :workfiles, :datasets, to: :model

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
      },

      :datasets => {
        :results => present_datasets_with_nested_highlights(datasets),
        :numFound => num_found[:datasets]
      }
    }
  end

  def present_models_with_highlights(models)
    models.collect do |model|
      m = (model.is_a? Workfile) ? model.latest_workfile_version : model
      hsh = present(m)

      hsh[:highlighted_attributes] = model.highlighted_attributes
      hsh[:comments] = model.search_result_comments
      hsh
    end
  end

  def present_datasets_with_nested_highlights(models)
    results = present_models_with_highlights(models)
    results.each do |result|
      schema_name = result[:highlighted_attributes].delete(:schema_name)
      result[:schema][:highlighted_attributes] = {:name => schema_name} if schema_name
      database_name = result[:highlighted_attributes].delete(:database_name)
      result[:schema][:database][:highlighted_attributes] = {:name => database_name} if database_name
      object_name = result[:highlighted_attributes].delete(:name)
      result[:highlighted_attributes][:object_name] = object_name if object_name
    end
    results
  end
end