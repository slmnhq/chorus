require 'digest/sha1'

class User < ActiveRecord::Base
  has_secure_password
  attr_accessible :username, :password, :password_confirmation
  establish_connection

  def self.authenticate(username, password)
    find_by_username(username).try(:authenticate, password)
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
