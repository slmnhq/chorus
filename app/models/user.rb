require 'digest/sha1'

class User < ActiveRecord::Base
  attr_accessible :username, :password, :first_name, :last_name, :email, :title, :dept, :notes
  attr_reader :password

  validates_presence_of :username, :first_name, :last_name, :email
  validates_uniqueness_of :username, :case_sensitive => false
  validates_format_of :email, :with => /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/
  validates_length_of :password, :minimum => 6, :unless => Proc.new { |user| !user.password_digest.nil? }

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
    end
  end
end
