require 'events/base'
require 'model_map'

module Events
  class Note < Base
    validates_presence_of :actor_id
    belongs_to :promoted_by, :class_name => 'User'

    searchable do
      text :body, :stored => true do
        search_body
      end
      string :grouping_id
      string :type_name
      string :security_type_name
    end
    attr_accessible :dataset_ids, :workfile_ids

    has_additional_data :body

    delegate :grouping_id, :type_name, :to => :primary_target

    def self.create_from_params(params, creator)
      body = params[:body]
      entity_id = params[:entity_id]
      entity_type = params[:entity_type]
      workspace_id = params[:workspace_id]
      insight = params[:is_insight]

      model = ModelMap.model_from_params(entity_type, entity_id)
      raise ActiveRecord::RecordNotFound unless model
      event_params = {
        entity_type => model,
        "body" => body,
        'dataset_ids' => params[:dataset_ids],
        'workfile_ids' => params[:workfile_ids],
        'insight' => insight
      }

      if insight
        event_params["promoted_by"] = creator
        event_params["promotion_time"] = Time.now
      end

      event_params["workspace"] = Workspace.find(workspace_id) if workspace_id
      event_class = event_class_for_model(model, workspace_id)
      event_class.by(creator).add(event_params)
    end

    def self.insights
      where(:insight => true)
    end

    def search_body
      result = ""
      doc = Nokogiri::HTML(body)
      doc.xpath("//text()").each do |node|
        if result.length > 0
          result += " "
        end
        result += node.to_s
      end
      result
    end

    def promote_to_insight(actor)
      self.insight = true
      self.promoted_by = actor
      touch(:promotion_time)
      save!
    end

    def publish_insight(actor)
      self.published = true
      save!
    end

    class << self
      private

      def include_shared_search_fields(target_name)
        klass = ModelMap::CLASS_MAP[target_name.to_s]
        define_shared_search_fields(klass.shared_search_fields, target_name)
      end

      def event_class_for_model(model, workspace_id)
        case model
          when GpdbInstance
            Events::NoteOnGreenplumInstance
          when GnipInstance
            Events::NoteOnGnipInstance
          when HadoopInstance
            Events::NoteOnHadoopInstance
          when Workspace
            Events::NoteOnWorkspace
          when Workfile
            Events::NoteOnWorkfile
          when HdfsEntry
            Events::NoteOnHdfsFile
          when Dataset
            workspace_id ? Events::NoteOnWorkspaceDataset : Events::NoteOnDataset
          else
            raise StandardError, "Unknown model type #{model.class.name}"
        end
      end
    end
  end
end

# Preload all note classes, otherwise, attachment.note will not work in dev mode.
require 'events/note_on_dataset'
require 'events/note_on_greenplum_instance'
require 'events/note_on_gnip_instance'
require 'events/note_on_hadoop_instance'
require 'events/note_on_hdfs_file'
require 'events/note_on_workfile'
require 'events/note_on_workspace'
require 'events/note_on_workspace_dataset'
