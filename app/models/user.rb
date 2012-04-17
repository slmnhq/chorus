require 'digest/sha1'

class User < ActiveRecord::Base
  has_secure_password
  attr_accessible :username, :password, :first_name, :last_name, :email, :title, :dept, :notes

  validates_presence_of :username, :first_name, :last_name, :email#TODO:, :password,
  validates_uniqueness_of :username, :case_sensitive => false
  validates_format_of :email, :with => /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/

  def self.authenticate(username, password)
    named(username).try(:authenticate, password)
  end

  def self.named(username)
    where("lower(users.username) = ?", username.downcase).first
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
    unless unencrypted_password.blank?
      self.password_digest = Digest::SHA1.hexdigest(unencrypted_password)
    end
  end
end
