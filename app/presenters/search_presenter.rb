class SearchPresenter < SearchPresenterBase

  delegate :users, :gpdb_instances, :hadoop_instances, :num_found, :workspaces, :workfiles, :datasets, :hdfs_entries, :attachments, :this_workspace, :search_type, :results, to: :model

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
            :results => present_models_with_highlights(datasets),
            :numFound => num_found[:datasets]
        },

        :hdfs => {
            :results => present_models_with_highlights(hdfs_entries),
            :numFound => num_found[:hdfs_entries]
        },

        :attachment => {
            :results => present_models_with_highlights(attachments),
            :numFound => num_found[:attachments]
        }
    }.merge(workspace_specific_results)
  end

  private

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
end
