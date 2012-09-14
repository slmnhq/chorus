class InstanceAccount < ActiveRecord::Base
  attr_accessible :db_username, :db_password
  validates_presence_of :db_username, :db_password, :gpdb_instance_id, :owner_id

  attr_accessor :db_password # not persisted in database

  belongs_to :owner, :class_name => 'User'
  belongs_to :gpdb_instance
  has_and_belongs_to_many :gpdb_databases

  before_save :encrypt_password
  after_find :decrypt_password

  private

  def encrypt_password
    self.encrypted_db_password = encrypt_cipher(db_password).unpack("H*").first if db_password
  end

  def decrypt_password
    self.db_password = decrypt_cipher([encrypted_db_password].pack("H*")) if encrypted_db_password
  end

  def passphrase
    Chorus::Application.config.chorus['passphrase'] || 'secret0123456789'
  end

  def decrypt_cipher(password)
    do_cipher(:decrypt, password)
  end

  def encrypt_cipher(password)
    do_cipher(:encrypt, password)
  end

  def do_cipher(method, password)
    cipher = OpenSSL::Cipher::AES.new("128-CBC").send(method)
    cipher.key = passphrase
    cipher.update(password) + cipher.final
  end
end