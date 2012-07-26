class Workspace < ActiveRecord::Base
  include SoftDelete
  attr_accessible :name, :public, :summary, :sandbox_id, :image

  has_attached_file :image, :path => Chorus::Application.config.chorus['image_storage'] + ":class/:id/:style/:basename.:extension",
                    :url => "/:class/:id/image?style=:style",
                    :default_url => "", :styles => {:original => "", :icon => "50x50>"}

  belongs_to :archiver, :class_name => 'User'
  belongs_to :owner, :class_name => 'User'
  has_many :memberships, :inverse_of => :workspace
  has_many :members, :through => :memberships, :source => :user
  has_many :workfiles
  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  belongs_to :sandbox, :class_name => 'GpdbSchema'

  has_many :csv_files

  has_many :associated_datasets
  has_many :bound_datasets, :through => :associated_datasets, :source => :dataset

  validates_presence_of :name
  validate :uniqueness_of_workspace_name
  validate :owner_is_member, :on => :update

  after_create :add_owner_as_member

  scope :active, where(:archived_at => nil)

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :summary, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
  end

  has_shared_search_fields [
    { :type => :integer, :method => :member_ids, :options => { :multiple => true } },
    { :type => :boolean, :method => :public }
  ]

  def self.search_permissions(current_user, search)
    unless current_user.admin?
      search.build do
        any_of do
          without :type_name, Workspace.type_name
          with :member_ids, current_user.id
          with :public, true
        end
      end
    end
  end

  def uniqueness_of_workspace_name
    if self.name
      other_workspace = Workspace.where("lower(name) = ?", self.name.downcase)
      other_workspace = other_workspace.where("id != ?", self.id) if self.id
      if other_workspace.present?
        errors.add(:name, :taken)
      end
    end
  end

  def datasets
    if sandbox
      associated_dataset_ids = associated_datasets.pluck(:dataset_id)
      Dataset.where("schema_id = ? OR id IN (?)", sandbox.id, associated_dataset_ids)
    else
      bound_datasets
    end
  end

  def self.accessible_to(user)
    with_membership = user.memberships.pluck(:workspace_id)
    where('workspaces.public OR
          workspaces.id IN (:with_membership) OR
          workspaces.owner_id = :user_id',
          :with_membership => with_membership,
          :user_id => user.id
         )
  end

  def members_accessible_to(user)
    if public? || members.include?(user)
      members
    else
      []
    end
  end

  def permissions_for(user)
    if user.admin? || (owner.id == user.id)
      [:admin]
    elsif user.memberships.find_by_workspace_id(id)
      [:read, :commenting, :update]
    elsif public?
      [:read, :commenting]
    else
      []
    end
  end

  def archived?
    archived_at?
  end

  def archive_as(user)
    self.archived_at = Time.current
    self.archiver = user
  end

  def unarchive
    self.archived_at = nil
    self.archiver = nil
  end

  def has_dataset?(dataset)
    dataset.schema == sandbox || bound_datasets.include?(dataset)
  end

  private

  def owner_is_member
    unless members.include? owner
      errors.add(:owner, "Owner must be a member")
    end
  end

  def add_owner_as_member
    unless members.include? owner
      memberships.create!({ :user => owner, :workspace => self }, { :without_protection => true })
    end
  end
end
