class Workfile < ActiveRecord::Base
  include SoftDelete

  attr_accessible :description, :file_name, :versions_attributes

  belongs_to :workspace
  belongs_to :owner, :class_name => 'User'

  has_many :versions, :class_name => 'WorkfileVersion'
  has_many :drafts, :class_name => 'WorkfileDraft'
  has_many :activities, :as => :entity
  has_many :events, :through => :activities

  belongs_to :latest_workfile_version, :class_name => 'WorkfileVersion'

  validates_format_of :file_name, :with => /^[a-zA-Z0-9_ \.\(\)\-]+$/

  before_validation :normalize_file_name, :on => :create
  before_validation :init_file_name, :on => :create

  accepts_nested_attributes_for :versions

  attr_accessor :highlighted_attributes, :search_result_comments
  searchable do
    text :file_name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :description, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    integer :workspace_id
    integer :member_ids, :multiple => true
    boolean :public
    string :grouping_id
    string :type_name
  end

  def self.search_permissions(current_user, search)
    unless current_user.admin?
      search.build do
        any_of do
          without :type_name, Workfile.type_name
          with :member_ids, current_user.id
          with :public, true
        end
      end
    end
  end

  def self.create_from_file_upload(attributes, workspace, owner)
    workfile = new(attributes)
    workfile.owner = owner
    workfile.workspace = workspace

    version = nil

    if(workfile.versions.first)
      version = workfile.versions.first
    else
      version = workfile.versions.build
      filename = workfile.file_name
      version.contents = File.new(File.join('/tmp/',filename), 'w')
    end

    version.owner = owner
    version.modifier = owner

    workfile.save!

    workfile.reload
  end

  def build_new_version(user, source_file, message)
    versions.build(
      :owner => user,
      :modifier => user,
      :contents => source_file,
      :version_num => last_version_number + 1,
      :commit_message => message,
    )
  end

  def has_draft(current_user)
    !!WorkfileDraft.find_by_owner_id_and_workfile_id(current_user.id, id)
  end

  def copy(user, workspace)
    workfile = Workfile.new
    workfile.file_name = file_name
    workfile.description = description
    workfile.workspace = workspace
    workfile.owner = user

    workfile
  end

  def member_ids
    workspace.member_ids
  end

  def public
    workspace.public
  end

  private
  def last_version_number
    latest_workfile_version.try(:version_num) || 0
  end

  def init_file_name
    self.file_name ||= versions.first.file_name
  end

  def normalize_file_name
    WorkfileName.resolve_name_for!(self)
  end
end
