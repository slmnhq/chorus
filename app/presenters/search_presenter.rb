class SearchPresenter < Presenter

  delegate :users, :gpdb_instances, :hadoop_instances, :num_found, :workspaces, :workfiles, :datasets, :hdfs_entries, :this_workspace, to: :model

  def to_hash
    {
      :users => {
        :results => present_models_with_highlights(users),
        :numFound => num_found[:users]
      },

      :instances => {
        :results => present_models_with_highlights(gpdb_instances),
        :numFound => num_found[:gpdb_instances]
      },

      :hadoop_instances => {
        :results => present_models_with_highlights(hadoop_instances),
        :numFound => num_found[:hadoop_instances]
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
      },

      :hdfs => {
        :results => present_models_with_highlights(hdfs_entries),
        :numFound => num_found[:hdfs_entries]
      }
    }.merge(workspace_specific_results)
  end

  def workspace_specific_results
    if model.workspace_id
      {
        :this_workspace => {
          :results => present_workspace_models_with_highlights(this_workspace),
          :numFound => num_found[:this_workspace]
        }
      }
    else
      {}
    end
  end

  def present_models_with_highlights(models, options = {})
    models.collect do |model|
      m = (model.is_a? Workfile) ? model.latest_workfile_version : model
      hsh = present(m, options)

      hsh[:highlighted_attributes] = model.highlighted_attributes
      hsh[:comments] = model.search_result_notes
      hsh[:entity_type] = model.entity_type_name
      hsh
    end
  end

  def present_datasets_with_nested_highlights(models)
    results = present_models_with_highlights(models)
    results.each do |result|
      extend_result_with_nested_highlights(result)
    end
    results
  end

  def present_workspace_models_with_highlights(models)
    results = present_models_with_highlights(models, :workspace => model.workspace)
    results.each do |result|
      if result[:entity_type] == 'dataset'
        extend_result_with_nested_highlights(result)
      end
    end
    results
  end

  private

  def extend_result_with_nested_highlights(result)
    schema_name = result[:highlighted_attributes].delete(:schema_name)
    result[:schema][:highlighted_attributes] = {:name => schema_name} if schema_name
    database_name = result[:highlighted_attributes].delete(:database_name)
    result[:schema][:database][:highlighted_attributes] = {:name => database_name} if database_name
    object_name = result[:highlighted_attributes].delete(:name)
    result[:highlighted_attributes][:object_name] = object_name if object_name
    column_name = result[:highlighted_attributes].delete(:column_name)
    result[:columns] = [{:highlighted_attributes => {:body => column_name}}] if column_name
  end
end
