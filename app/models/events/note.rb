module Events
  class Note < Base
    validates_presence_of :actor_id
    has_many :attachments, :class_name => 'NoteAttachment'
    searchable do |s|
      s.text :body, :stored => true
      s.string :grouping_id
      s.string :type_name
    end

    has_additional_data :body

    delegate :grouping_id, :type_name, :to => :primary_target

    def self.create_from_params(params, creator)
      body = params[:body]
      entity_id = params[:entity_id]
      entity_type = params[:entity_type]
      workspace_id = params[:workspace_id]

      model = ModelMap.model_from_params(entity_type, entity_id)
      raise ActiveRecord::RecordNotFound unless model
      event_params = { entity_type => model, "body" => body }
      event_params["workspace"] = Workspace.find(workspace_id) if workspace_id
      event_class = event_class_for_model(model, workspace_id)
      event_class.by(creator).add(event_params)
    end

    def create_attachments(source_file)
      attachments.create!(:contents => source_file)
    end

    class << self
      private

      def include_shared_search_fields(target_name)
        klass = ModelMap::CLASS_MAP[target_name.to_s]
        define_shared_search_fields(klass.shared_search_fields, target_name)
      end

      def event_class_for_model(model, workspace_id)
        case model
        when Instance
          NOTE_ON_GREENPLUM_INSTANCE
        when HadoopInstance
          NOTE_ON_HADOOP_INSTANCE
        when Workspace
          NOTE_ON_WORKSPACE
        when Workfile
          NOTE_ON_WORKFILE
        when HdfsFileReference
          NOTE_ON_HDFS_FILE
        when Dataset
          workspace_id ? NOTE_ON_WORKSPACE_DATASET : NOTE_ON_DATASET
        end
      end
    end
  end

  class NOTE_ON_GREENPLUM_INSTANCE < Note
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
  end

  class NOTE_ON_HADOOP_INSTANCE < Note
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
  end

  class NOTE_ON_HDFS_FILE < Note
    has_targets :hdfs_file
    has_activities :actor, :hdfs_file, :global
  end

  class NOTE_ON_WORKSPACE < Note
    has_targets :workspace
    has_activities :actor, :workspace

    validate :no_note_on_archived_workspace

    def no_note_on_archived_workspace
      errors.add(:workspace, :generic , {:message => "Can not add a note on an archived workspace"} ) if workspace.archived?
    end

    include_shared_search_fields(:workspace)
  end

  class NOTE_ON_WORKFILE < Note
    has_targets :workfile
    has_activities :actor, :workfile, :workspace

    include_shared_search_fields(:workspace)
  end

  class NOTE_ON_DATASET < Note
    has_targets :dataset
    has_activities :actor, :dataset, :global

    include_shared_search_fields(:dataset)
  end

  class NOTE_ON_WORKSPACE_DATASET < Note
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace

    include_shared_search_fields(:dataset)
  end
end
