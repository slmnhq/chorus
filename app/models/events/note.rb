module Events
  UnknownEntityType = Class.new(StandardError)

  class Note < Base
    validates_presence_of :actor_id
    searchable do
      text :body, :stored => true
      string :grouping_id
      string :type_name
    end

    def self.create_from_params(params, creator)
      entity_id = params[:entity_id]
      entity_type = params[:entity_type]
      body = params[:body]
      workspace_id = params[:workspace_id]

      case entity_type
        when "greenplum_instance"
          instance = Instance.find(entity_id)
          Events::NOTE_ON_GREENPLUM_INSTANCE.by(creator).add(:greenplum_instance => instance, :body => body)
        when "hadoop_instance"
          instance = HadoopInstance.find(entity_id)
          Events::NOTE_ON_HADOOP_INSTANCE.by(creator).add(:hadoop_instance => instance, :body => body)
        when "hdfs"
          hadoop_instance_id, path = entity_id.split('|')
          hdfs_file_reference = HdfsFileReference.find_or_create_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
          Events::NOTE_ON_HDFS_FILE.by(creator).add(:hdfs_file => hdfs_file_reference, :body => body)
        when "workspace"
          workspace = Workspace.find(entity_id)
          if workspace && (WorkspaceAccess.member_of_workspaces(creator).include?(workspace) || workspace.public)
            Events::NOTE_ON_WORKSPACE.by(creator).add(:workspace =>workspace, :body => body)
          end
        when "dataset"
          dataset = Dataset.find(entity_id)
          Events::NOTE_ON_DATASET.by(creator).add(:dataset => dataset, :body => body)
        when "workspace_dataset"
          dataset = Dataset.find(entity_id)
          workspace = Workspace.find(workspace_id)
          Events::NOTE_ON_WORKSPACE_DATASET.by(creator).add(:dataset => dataset, :workspace => workspace, :body => body)
        when "workfile"
          workfile = Workfile.find(entity_id)
          Events::NOTE_ON_WORKFILE.by(creator).add(:workfile =>workfile, :body => body)
        else
          raise UnknownEntityType
      end
    end

    def grouping_id
      (target1 && target1.grouping_id) || workspace.grouping_id
    end

    def type_name
      (target1 && target1.type_name) || workspace.type_name
    end
  end

  class NOTE_ON_GREENPLUM_INSTANCE < Note
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
    has_additional_data :body
  end

  class NOTE_ON_HADOOP_INSTANCE < Note
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
    has_additional_data :body
  end

  class NOTE_ON_HDFS_FILE < Note
    has_targets :hdfs_file
    has_activities :actor, :hdfs_file, :global
    has_additional_data :body
  end

  class NOTE_ON_WORKSPACE < Note
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :body

    validate :no_note_on_archived_workspace

    def no_note_on_archived_workspace
      errors.add(:workspace, :generic , {:message => "Can not add a note on an archived workspace"} ) if workspace.archived?
    end
  end

  class NOTE_ON_WORKFILE < Note
    has_targets :workfile
    has_activities :actor, :workfile
    has_additional_data :body
  end


  class NOTE_ON_DATASET < Note
    has_targets :dataset
    has_activities :actor, :dataset, :global
    has_additional_data :body
  end

  class NOTE_ON_WORKSPACE_DATASET < Note
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace
    has_additional_data :body
  end
end
