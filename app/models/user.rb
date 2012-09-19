require 'digest'
require 'soft_delete'

class User < ActiveRecord::Base
  include SoftDelete

  VALID_SORT_ORDERS = HashWithIndifferentAccess.new(
    :first_name => "LOWER(users.first_name)",
    :last_name => "LOWER(users.last_name)"
  )

  DEFAULT_SORT_ORDER = VALID_SORT_ORDERS[:first_name]

  attr_accessible :username, :password, :first_name, :last_name, :email, :title, :dept, :notes
  attr_reader :password

  has_many :gpdb_instances, :foreign_key => :owner_id
  has_many :owned_workspaces, :foreign_key => :owner_id, :class_name => 'Workspace'
  has_many :memberships
  has_many :workspaces, :through => :memberships
  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  has_many :notifications, :foreign_key => 'recipient_id'

  has_many :notification_events, :through => :notifications, :class_name => 'Events::Base'

  has_many :comments

  has_many :instance_accounts, :foreign_key => :owner_id
  has_many :hadoop_instances, :foreign_key => :owner_id

  has_attached_file :image, :path => Chorus::Application.config.chorus['image_storage'] + ":class/:id/:style/:basename.:extension",
                    :url => "/:class/:id/image?style=:style",
                    :default_url => '/images/default-user-icon.png', :styles => {:icon => "50x50>"}

  validates_presence_of :username, :first_name, :last_name, :email
  validate :uniqueness_of_non_deleted_username
  validates_format_of :email, :with => /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/
  validates_format_of :username, :with => /^\S+$/
  validates_presence_of :password, :unless => lambda { password_digest? || LdapClient.enabled? }
  validates_length_of :password, :minimum => 6, :maximum => 256, :if => :password
  validates_length_of :username, :first_name, :last_name, :email, :title, :dept, :maximum => 256
  validates_length_of :notes, :maximum => 4096
  validates_attachment_size :image, :less_than => Chorus::Application.config.chorus['file_sizes_mb']['user_icon'].megabytes, :message => :file_size_exceeded

  attr_accessor :highlighted_attributes, :search_result_notes
  searchable do
    text :first_name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :last_name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :username, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    text :email, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    string :grouping_id
    string :type_name
  end

  def accessible_events(current_user)
    events.where("workspace_id IS NULL
                    OR workspace_id IN
                      (SELECT id FROM workspaces
                        WHERE public IS TRUE)
                    OR workspace_id IN
                      (SELECT workspace_id FROM memberships
                        WHERE user_id = #{current_user.id})").includes(:actor, :target1, :target2)
  end

  def uniqueness_of_non_deleted_username
    if self.username
      other_user = User.where("lower(users.username) = ?", self.username.downcase)
      other_user = other_user.where("id != ?", self.id) if self.id
      if other_user.present?
        errors.add(:username, :taken)
      end
    end
  end

  def self.order(field)
    sort_by = VALID_SORT_ORDERS[field] || DEFAULT_SORT_ORDER
    super(sort_by)
  end

  def self.authenticate(username, password)
    named(username).try(:authenticate, password)
  end

  def self.named(username)
    where("lower(users.username) = ?", username.downcase).first
  end

  def self.admin_count
    admin.size
  end

  def self.admin
    where(:admin => true)
  end

  def admin=(value)
    if admin? && self.class.admin_count == 1
      value = true
    end

    write_attribute(:admin, value)
  end

  # TODO: if user doesn't have sha256 digest but encrypted password + key,
  #       it's his first login and the password should be converted to sha256
  def authenticate(unencrypted_password)
    if Digest::SHA256.hexdigest(unencrypted_password + password_salt) == password_digest
      self
    else
      false
    end
  end

  def password=(unencrypted_password)
    self.password_salt = SecureRandom.hex(20)
    @password = unencrypted_password
    unless unencrypted_password.blank? || unencrypted_password.length < 6
      self.password_digest = Digest::SHA256.hexdigest(unencrypted_password + password_salt)
    else
      self.password_digest = nil
    end
  end

  def destroy
    if gpdb_instances.count > 0
      errors.add(:user, :nonempty_instance_list)
      raise ActiveRecord::RecordInvalid.new(self)
    elsif owned_workspaces.count > 0
      errors.add(:workspace_count, :equal_to, {:count => 0})
      raise ActiveRecord::RecordInvalid.new(self)
    end
    super
  end

  def accessible_account_ids
    shared_account_ids = InstanceAccount.joins(:gpdb_instance).where("gpdb_instances.shared = true").collect(&:id)
    (shared_account_ids + instance_account_ids).uniq
  end
end
