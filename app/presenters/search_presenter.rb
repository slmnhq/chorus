class SearchPresenter < SearchPresenterBase

  delegate :users, :gpdb_instances, :hadoop_instances, :num_found, :workspaces, :workfiles, :datasets, :hdfs_entries, :this_workspace, :search_type, :results, to: :model

  def to_hash
    case search_type
      when :type_ahead then type_ahead_results
      else per_type_results
    end
  end

  private

  def type_ahead_results
    model.models # TODO: figure out a better way to force execution of the search
    {
        type_ahead: {
            results:
                present_models_with_highlights(results)
        }
    }
  end

  def per_type_results
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

  def present_datasets_with_nested_highlights(models)
    results = present_models_with_highlights(models)
    results.each do |result|
      extend_result_with_nested_highlights(result)
    end
    results
  end
end
