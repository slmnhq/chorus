require 'digest/sha1'

class User < ActiveRecord::Base
  default_scope :conditions => {:deleted_at => nil}
  attr_accessible :username, :password, :first_name, :last_name, :email, :title, :dept, :notes
  attr_reader :password

  has_many :instances, :foreign_key => :owner_id
  has_many :workspaces, :foreign_key => :owner_id

  has_attached_file :image, :default_url => '/images/default-user-icon.png', :styles => {:original => "", :icon => "50x50>"}

  validates_presence_of :username, :first_name, :last_name, :email
  validate :uniqueness_of_non_deleted_username
  validates_format_of :email, :with => /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/
  validates_format_of :username, :with => /^\S+$/
  validates_presence_of :password, :unless => lambda{ password_digest? || LdapClient.enabled? }
  validates_length_of :password, :minimum => 6, :maximum => 256, :if => :password
  validates_length_of :username, :first_name, :last_name, :email, :title, :dept, :maximum => 256
  validates_length_of :notes, :maximum => 4096

  def uniqueness_of_non_deleted_username
    if self.username
      other_user = User.where("lower(users.username) = ?", self.username.downcase)
      other_user = other_user.where("id != ?", self.id) if self.id
      if other_user.present?
        errors.add(:username, :taken)
      end
    end
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

  # override has_secure_password so that our old SHA1 password hashes work
  def authenticate(unencrypted_password)
    if Digest::SHA1.hexdigest(unencrypted_password) == password_digest
      self
    else
      false
    end
  end

  def password=(unencrypted_password)
    @password = unencrypted_password
    unless unencrypted_password.blank? || unencrypted_password.length < 6
      self.password_digest = Digest::SHA1.hexdigest(unencrypted_password)
    else
      self.password_digest = nil
    end
  end

  def destroy
    if instances.count > 0
      errors.add(:instance_count, :equal_to, {:count => 0})
      raise ActiveRecord::RecordInvalid.new(self)
    end
    self.deleted_at = Time.now.utc
    save
  end

  def self.find_with_destroyed *args
    self.with_exclusive_scope { find(*args) }
  end
end
