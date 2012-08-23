module Events
  class Note < Base
    validates_presence_of :actor_id
    has_many :attachments, :class_name => 'NoteAttachment'
    searchable do |s|
      s.text :body, :stored => true do
        search_body
      end
      s.string :grouping_id
      s.string :type_name
    end
    has_and_belongs_to_many :datasets
    attr_accessible :dataset_ids, :datasets

    has_and_belongs_to_many :workfiles
    attr_accessible :workfile_ids, :workfile

    has_additional_data :body

    delegate :grouping_id, :type_name, :to => :primary_target

    def self.create_from_params(params, creator)
      body = params[:body]
      entity_id = params[:entity_id]
      entity_type = params[:entity_type]
      workspace_id = params[:workspace_id]

      model = ModelMap.model_from_params(entity_type, entity_id)
      raise ActiveRecord::RecordNotFound unless model
      event_params = {entity_type => model, "body" => body, 'dataset_ids' => params[:dataset_ids], 'workfile_ids' => params[:workfile_ids]}
      event_params["workspace"] = Workspace.find(workspace_id) if workspace_id
      event_class = event_class_for_model(model, workspace_id)
      event_class.by(creator).add(event_params)
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

    class << self
      private

      def include_shared_search_fields(target_name)
        klass = ModelMap::CLASS_MAP[target_name.to_s]
        define_shared_search_fields(klass.shared_search_fields, target_name)
      end

      def event_class_for_model(model, workspace_id)
        case model
          when Instance
            Events::NoteOnGreenplumInstance
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
        end
      end
    end
  end
end
