class Attachment < ActiveRecord::Base
  attr_accessible :contents

  has_attached_file :contents,
                    :path => Chorus::Application.config.chorus['assets_storage_path'] + ":class/:id/:style/:basename.:extension",
                    :url => "/notes/:note_id/attachments/:id?style=:style",
                    :styles => {:original => "", :icon => "50x50>" }

  before_post_process :contents_are_image?

  #TODO: eager loading :attachments => :note requires this condition to be here, eager loading bug? - BL
  belongs_to :note, :class_name => 'Events::Base', :conditions => "events.action ILIKE 'Events::Note%'"

  validates_attachment_size :contents, :less_than => Chorus::Application.config.chorus['file_sizes_mb']['attachment'].megabytes, :message => :file_size_exceeded

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable do
    text :name, :stored => true, :using => :contents_file_name, :boost => SOLR_PRIMARY_FIELD_BOOST
    string :grouping_id
    string :type_name
    string :security_type_name
  end

  def self.include_shared_search_fields(target_name)
    klass = ModelMap::CLASS_MAP[target_name.to_s]
    define_shared_search_fields(klass.shared_search_fields, :note, :proc => proc { |method_name|
      if note.respond_to? :"search_#{method_name}"
        note.send(:"search_#{method_name}")
      end
    })
  end

  include_shared_search_fields(:workspace)
  include_shared_search_fields(:dataset)

  def self.add_search_permissions(current_user, search)
    [Dataset, Workspace, Workfile].each do |klass|
      klass.add_search_permissions(current_user, search)
    end
  end

  def security_type_name
    note.security_type_name
  end

  def contents_are_image?
    MIME::Types.type_for(contents_file_name).first.to_s.starts_with?('image/')
  end
end
